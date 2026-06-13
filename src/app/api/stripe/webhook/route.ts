import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getStripe, STRIPE_WEBHOOK_SECRET, isStripeDemoMode } from '@/lib/stripe'

// Disable body parsing - Stripe needs the raw body to verify signatures
export async function POST(request: NextRequest) {
  if (isStripeDemoMode) {
    return NextResponse.json({ received: true, demo: true })
  }

  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Record<string, unknown>
        const metadata = session.metadata as Record<string, string> | undefined
        if (!metadata) break

        const userId = metadata.userId
        const planId = metadata.planId
        const interval = metadata.interval as 'monthly' | 'yearly'

        if (!userId || !planId) break

        // Create subscription in DB
        const now = new Date()
        const periodEnd = new Date(now)
        if (interval === 'yearly') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1)
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1)
        }

        const plan = await db.plan.findUnique({ where: { id: planId } })
        if (!plan) break

        // Cancel existing subscription
        const existingSub = await db.subscription.findFirst({
          where: { userId, status: 'active' },
        })
        if (existingSub) {
          await db.subscription.update({
            where: { id: existingSub.id },
            data: { status: 'canceled' },
          })
        }

        const stripeSubscriptionId = session.subscription as string | undefined
        const stripeCustomerId = session.customer as string | undefined

        const subscription = await db.subscription.create({
          data: {
            userId,
            planId,
            status: 'active',
            interval,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            stripeSubscriptionId: stripeSubscriptionId || null,
            stripeCustomerId: stripeCustomerId || null,
          },
        })

        // Update user
        const user = await db.user.findUnique({ where: { id: userId } })
        const creditAmount = plan.credits
        await db.user.update({
          where: { id: userId },
          data: {
            planId,
            credits: (user?.credits || 0) + creditAmount,
            stripeCustomerId: stripeCustomerId || user?.stripeCustomerId || null,
            stripeSubscriptionId: stripeSubscriptionId || null,
          },
        })

        // Credit transaction
        await db.creditTransaction.create({
          data: {
            userId,
            amount: creditAmount,
            balance: (user?.credits || 0) + creditAmount,
            type: 'subscription',
            description: `${plan.name} plan - ${interval} subscription`,
            referenceId: subscription.id,
          },
        })
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Record<string, unknown>
        const stripeSubId = sub.id as string

        const dbSub = await db.subscription.findFirst({
          where: { stripeSubscriptionId: stripeSubId },
        })
        if (!dbSub) break

        const status = sub.status as string
        const cancelAtPeriodEnd = sub.cancel_at_period_end as boolean
        const currentPeriodEnd = new Date((sub.current_period_end as number) * 1000)

        await db.subscription.update({
          where: { id: dbSub.id },
          data: {
            status,
            cancelAtPeriodEnd,
            currentPeriodEnd,
          },
        })

        if (status === 'canceled') {
          await db.user.update({
            where: { id: dbSub.userId },
            data: { stripeSubscriptionId: null },
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Record<string, unknown>
        const stripeSubId = sub.id as string

        const dbSub = await db.subscription.findFirst({
          where: { stripeSubscriptionId: stripeSubId },
        })
        if (!dbSub) break

        await db.subscription.update({
          where: { id: dbSub.id },
          data: { status: 'canceled' },
        })

        await db.user.update({
          where: { id: dbSub.userId },
          data: { stripeSubscriptionId: null },
        })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Record<string, unknown>
        const customerId = invoice.customer as string

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (!user) break

        // Find active subscription
        const sub = await db.subscription.findFirst({
          where: { userId: user.id, status: 'active' },
          include: { plan: true },
        })
        if (!sub) break

        // Add credits for renewal
        await db.creditTransaction.create({
          data: {
            userId: user.id,
            amount: sub.plan.credits,
            balance: user.credits + sub.plan.credits,
            type: 'subscription',
            description: `${sub.plan.name} plan renewal`,
            referenceId: invoice.id as string,
          },
        })

        await db.user.update({
          where: { id: user.id },
          data: { credits: user.credits + sub.plan.credits },
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Record<string, unknown>
        const customerId = invoice.customer as string

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (!user) break

        const sub = await db.subscription.findFirst({
          where: { userId: user.id, status: 'active' },
        })
        if (!sub) break

        await db.subscription.update({
          where: { id: sub.id },
          data: { status: 'past_due' },
        })
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
