import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getStripe, isStripeDemoMode, simulateCheckout, PLAN_CONFIGS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, tier, interval } = body as {
      userId: string
      tier: 'starter' | 'agency' | 'enterprise'
      interval: 'monthly' | 'yearly'
    }

    if (!userId || !tier || !interval) {
      return NextResponse.json(
        { error: 'userId, tier, and interval are required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find the plan config
    const planConfig = PLAN_CONFIGS.find((p) => p.tier === tier)
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan tier' }, { status: 400 })
    }

    const price = interval === 'monthly' ? planConfig.monthlyPrice : planConfig.yearlyPrice
    const credits = interval === 'monthly' ? planConfig.monthlyCredits : planConfig.yearlyCredits

    if (isStripeDemoMode) {
      // ─── Demo Mode: Create subscription directly ─────────────────────
      // Find or create the plan in the database
      const planName = `${planConfig.name} ${interval === 'yearly' ? 'Yearly' : 'Monthly'}`
      let plan = await db.plan.findUnique({ where: { name: planName } })

      if (!plan) {
        plan = await db.plan.create({
          data: {
            name: planName,
            description: planConfig.description,
            price,
            yearlyPrice: interval === 'yearly' ? price : planConfig.yearlyPrice,
            credits: credits === -1 ? 999999 : credits,
            features: JSON.stringify(planConfig.features),
            popular: planConfig.popular,
            maxLeads: planConfig.maxLeads === -1 ? 999999 : planConfig.maxLeads,
            maxSearches: planConfig.maxSearches === -1 ? 999999 : planConfig.maxSearches,
            maxExports: planConfig.maxExports === -1 ? 999999 : planConfig.maxExports,
            tier: planConfig.tier,
            interval,
          },
        })
      }

      // Cancel any existing active subscription
      const existingSub = await db.subscription.findFirst({
        where: { userId, status: 'active' },
      })

      if (existingSub) {
        await db.subscription.update({
          where: { id: existingSub.id },
          data: { status: 'canceled' },
        })
      }

      // Create new subscription
      const now = new Date()
      const periodEnd = new Date(now)
      if (interval === 'monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1)
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1)
      }

      const subscription = await db.subscription.create({
        data: {
          userId,
          planId: plan.id,
          status: 'active',
          interval,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          stripeSubscriptionId: `sub_demo_${Date.now()}`,
          stripeCustomerId: user.stripeCustomerId || `cus_demo_${Date.now()}`,
        },
      })

      // Update user's plan and credits
      const creditAmount = credits === -1 ? 999999 : credits
      await db.user.update({
        where: { id: userId },
        data: {
          planId: plan.id,
          credits: user.credits + creditAmount,
          stripeCustomerId: subscription.stripeCustomerId,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
        },
      })

      // Create credit transaction
      await db.creditTransaction.create({
        data: {
          userId,
          amount: creditAmount,
          balance: user.credits + creditAmount,
          type: 'subscription',
          description: `${planConfig.name} plan - ${interval} subscription`,
          referenceId: subscription.id,
        },
      })

      const demoResult = simulateCheckout(planConfig, interval)

      return NextResponse.json({
        demo: true,
        sessionId: demoResult.sessionId,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          interval: subscription.interval,
          currentPeriodEnd: subscription.currentPeriodEnd,
          plan: {
            id: plan.id,
            name: plan.name,
            tier: plan.tier,
            price: plan.price,
          },
        },
        message: 'Subscription activated successfully (Demo Mode)',
      })
    }

    // ─── Live Stripe Mode ──────────────────────────────────────────────
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // Find or create Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await db.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      })
    }

    // Find or create the plan in DB
    const planName = `${planConfig.name} ${interval === 'yearly' ? 'Yearly' : 'Monthly'}`
    let plan = await db.plan.findUnique({ where: { name: planName } })

    if (!plan) {
      // Create Stripe product and price
      const product = await stripe.products.create({
        name: planName,
        description: planConfig.description,
        metadata: { tier: planConfig.tier, interval },
      })

      const stripePrice = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(price * 100), // Stripe uses cents/paise
        currency: 'inr',
        recurring: {
          interval: interval === 'yearly' ? 'year' : 'month',
        },
        metadata: { tier: planConfig.tier },
      })

      const creditAmount = credits === -1 ? 999999 : credits
      plan = await db.plan.create({
        data: {
          name: planName,
          description: planConfig.description,
          price,
          yearlyPrice: interval === 'yearly' ? price : planConfig.yearlyPrice,
          credits: creditAmount,
          features: JSON.stringify(planConfig.features),
          popular: planConfig.popular,
          maxLeads: planConfig.maxLeads === -1 ? 999999 : planConfig.maxLeads,
          maxSearches: planConfig.maxSearches === -1 ? 999999 : planConfig.maxSearches,
          maxExports: planConfig.maxExports === -1 ? 999999 : planConfig.maxExports,
          tier: planConfig.tier,
          interval,
          stripePriceId: stripePrice.id,
          stripeProductId: product.id,
        },
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`,
      metadata: {
        userId: user.id,
        planId: plan.id,
        tier: planConfig.tier,
        interval,
      },
    })

    return NextResponse.json({
      demo: false,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
