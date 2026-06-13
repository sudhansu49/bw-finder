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
        plan: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            credits: true,
            features: true,
            popular: true,
            maxLeads: true,
            maxSearches: true,
            maxExports: true,
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

    // Fetch active subscription
    const subscription = await db.subscription.findFirst({
      where: { userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            credits: true,
            features: true,
            maxLeads: true,
            maxSearches: true,
            maxExports: true,
            tier: true,
            interval: true,
          },
        },
      },
    })

    // Compute usage data for the current billing period
    const periodStart = subscription?.currentPeriodStart ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    const [leadsCount, searchesCount, exportsCount] = await Promise.all([
      // Leads created in this period
      db.lead.count({
        where: {
          userId,
          createdAt: { gte: periodStart },
        },
      }),
      // Searches performed in this period
      db.searchJob.count({
        where: {
          userId,
          createdAt: { gte: periodStart },
        },
      }),
      // Exports performed in this period (tracked via credit transactions)
      db.creditTransaction.count({
        where: {
          userId,
          type: 'usage',
          description: { contains: 'export' },
          createdAt: { gte: periodStart },
        },
      }),
    ])

    // Fetch all available plans
    const allPlans = await db.plan.findMany({
      orderBy: { price: 'asc' },
    })

    // Billing history from credit transactions
    const billingHistory = await db.creditTransaction.findMany({
      where: {
        userId,
        type: { in: ['purchase', 'refund', 'subscription'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 24,
    })

    // Determine plan limits
    const currentPlan = subscription?.plan ?? user.plan
    const maxLeads = currentPlan?.maxLeads ?? 100
    const maxSearches = currentPlan?.maxSearches ?? 50
    const maxExports = currentPlan?.maxExports ?? 20

    return NextResponse.json({
      currentPlan: currentPlan ?? null,
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            trialEnd: subscription.trialEnd,
            createdAt: subscription.createdAt,
          }
        : null,
      usage: {
        leads: { used: leadsCount, limit: maxLeads },
        searches: { used: searchesCount, limit: maxSearches },
        exports: { used: exportsCount, limit: maxExports },
        credits: { remaining: user.credits, total: currentPlan?.credits ?? 0 },
      },
      allPlans,
      billingHistory,
    })
  } catch (error) {
    console.error('Get subscription details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    )
  }
}
