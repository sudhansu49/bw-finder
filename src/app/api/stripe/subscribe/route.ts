import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Change subscription plan (upgrade/downgrade)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, planId, interval } = body as {
      userId: string
      planId: string
      interval: 'monthly' | 'yearly'
    }

    if (!userId || !planId) {
      return NextResponse.json(
        { error: 'userId and planId are required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const newPlan = await db.plan.findUnique({ where: { id: planId } })
    if (!newPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

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

    // Create new subscription
    const now = new Date()
    const periodEnd = new Date(now)
    if (interval === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    const subscription = await db.subscription.create({
      data: {
        userId,
        planId: newPlan.id,
        status: 'active',
        interval,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: `sub_demo_${Date.now()}`,
        stripeCustomerId: user.stripeCustomerId || `cus_demo_${Date.now()}`,
      },
    })

    // Update user
    const creditAmount = newPlan.credits
    await db.user.update({
      where: { id: userId },
      data: {
        planId: newPlan.id,
        credits: user.credits + creditAmount,
        stripeCustomerId: subscription.stripeCustomerId,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
      },
    })

    // Credit transaction
    await db.creditTransaction.create({
      data: {
        userId,
        amount: creditAmount,
        balance: user.credits + creditAmount,
        type: 'subscription',
        description: `Plan changed to ${newPlan.name} - ${interval}`,
        referenceId: subscription.id,
      },
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        interval: subscription.interval,
        currentPeriodEnd: subscription.currentPeriodEnd,
        plan: {
          id: newPlan.id,
          name: newPlan.name,
          tier: newPlan.tier,
          price: newPlan.price,
        },
      },
    })
  } catch (error) {
    console.error('Change plan error:', error)
    return NextResponse.json(
      { error: 'Failed to change plan' },
      { status: 500 }
    )
  }
}
