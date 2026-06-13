import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getStripe, isStripeDemoMode, simulatePortal } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body as { userId: string }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (isStripeDemoMode || !user.stripeCustomerId) {
      // Demo mode - return simulated portal
      const demoResult = simulatePortal()
      return NextResponse.json({
        demo: true,
        url: null,
        sessionId: demoResult.sessionId,
        message: 'Customer portal not available in demo mode. Manage your subscription from the billing page.',
      })
    }

    // Live Stripe mode
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`,
    })

    return NextResponse.json({
      demo: false,
      url: session.url,
    })
  } catch (error) {
    console.error('Stripe portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
