import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getStripe, isStripeDemoMode } from '@/lib/stripe'
import { requireOwnerOrAdmin } from '@/lib/auth/jwt'
import { applyRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { auditSubscriptionCancel, getRequestInfo } from '@/lib/security/audit'

export async function POST(request: NextRequest) {
  // Rate limiting
  const rl = applyRateLimit(request, RATE_LIMITS.checkout)
  if (rl) return rateLimitResponse(rl)

  try {
    const body = await request.json()
    const { userId, immediately } = body as { userId: string; immediately?: boolean }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Auth check
    const authResult = await requireOwnerOrAdmin(request, userId)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const subscription = await db.subscription.findFirst({
      where: { userId, status: 'active' },
      include: { plan: { select: { name: true } } },
    })

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    const { ip } = getRequestInfo(request)

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

      await auditSubscriptionCancel(userId, subscription.plan?.name || 'Unknown', authResult.payload.sub, ip)

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

    await auditSubscriptionCancel(userId, subscription.plan?.name || 'Unknown', authResult.payload.sub, ip)

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
