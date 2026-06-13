import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getStripe, isStripeDemoMode } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, immediately } = body as { userId: string; immediately?: boolean }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const subscription = await db.subscription.findFirst({
      where: { userId, status: 'active' },
    })

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    if (isStripeDemoMode || !subscription.stripeSubscriptionId) {
      // Demo mode: cancel directly in DB
      if (immediately) {
        await db.subscription.update({
          where: { id: subscription.id },
          data: { status: 'canceled' },
        })
        await db.user.update({
          where: { id: userId },
          data: { stripeSubscriptionId: null },
        })
      } else {
        await db.subscription.update({
          where: { id: subscription.id },
          data: { cancelAtPeriodEnd: true },
        })
      }

      return NextResponse.json({
        demo: true,
        canceled: true,
        immediately: !!immediately,
        message: immediately
          ? 'Subscription canceled immediately (Demo Mode)'
          : 'Subscription will be canceled at the end of the billing period (Demo Mode)',
      })
    }

    // Live Stripe mode
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    if (immediately) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
    } else {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })
    }

    return NextResponse.json({
      demo: false,
      canceled: true,
      immediately: !!immediately,
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
