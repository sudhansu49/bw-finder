import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        credits: true,
        planId: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            credits: true,
            tier: true,
            interval: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch recent credit transactions
    const creditTransactions = await db.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Fetch active subscription
    const subscription = await db.subscription.findFirst({
      where: { userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            credits: true,
            tier: true,
            interval: true,
          },
        },
      },
    })

    // Compute payment summary from credit transactions
    const totalSpent = creditTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const totalPurchased = creditTransactions
      .filter((t) => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0)

    const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const thisMonthSpent = creditTransactions
      .filter((t) => t.amount < 0 && new Date(t.createdAt) >= thisMonth)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // Mock payment method data (no Stripe integration)
    const paymentMethod = {
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2026,
    }

    // Build invoice-like data from transactions
    const invoices = creditTransactions
      .filter((t) => t.type === 'purchase')
      .map((t) => ({
        id: t.id,
        amount: t.amount,
        description: t.description,
        date: t.createdAt,
        status: 'paid' as const,
      }))

    return NextResponse.json({
      currentBalance: user.credits,
      creditTransactions,
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            plan: subscription.plan,
          }
        : null,
      paymentMethod,
      paymentSummary: {
        totalSpent,
        totalPurchased,
        thisMonthSpent,
        planPrice: user.plan?.price || 0,
      },
      invoices,
    })
  } catch (error) {
    console.error('Get billing data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing data' },
      { status: 500 }
    )
  }
}
