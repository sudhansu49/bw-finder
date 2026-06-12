import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    // ── 1. User Stats ─────────────────────────────────────────────
    const totalUsers = await db.user.count()
    const newUsersThisMonth = await db.user.count({
      where: { createdAt: { gte: monthStart } },
    })
    const activeUsers = await db.user.count({
      where: { status: 'active' },
    })

    // Users by role
    const usersByRoleRaw = await db.user.groupBy({
      by: ['role'],
      _count: { role: true },
    })
    const usersByRole = usersByRoleRaw.map((item) => ({
      role: item.role,
      count: item._count.role,
    }))

    // Users by plan
    const usersByPlanRaw = await db.user.groupBy({
      by: ['planId'],
      _count: { planId: true },
      where: { planId: { not: null } },
    })
    const plans = await db.plan.findMany({
      select: { id: true, name: true },
    })
    const planMap = new Map(plans.map((p) => [p.id, p.name]))
    const usersByPlan = usersByPlanRaw.map((item) => ({
      planId: item.planId,
      planName: planMap.get(item.planId!) || 'Unknown',
      count: item._count.planId,
    }))

    // Users without a plan
    const usersWithoutPlan = await db.user.count({
      where: { planId: null },
    })
    usersByPlan.push({ planId: null, planName: 'No Plan', count: usersWithoutPlan })

    // ── 2. Subscription Stats ─────────────────────────────────────
    const activeSubscriptions = await db.subscription.count({
      where: { status: 'active' },
    })
    const canceledSubscriptions = await db.subscription.count({
      where: { status: 'canceled' },
    })
    const expiredSubscriptions = await db.subscription.count({
      where: { status: 'expired' },
    })
    const pastDueSubscriptions = await db.subscription.count({
      where: { status: 'past_due' },
    })

    // MRR: sum of active subscription plan prices
    const activeSubs = await db.subscription.findMany({
      where: { status: 'active' },
      include: {
        plan: { select: { price: true } },
      },
    })
    const mrr = activeSubs.reduce((sum, sub) => sum + sub.plan.price, 0)

    // ── 3. Credit Stats ───────────────────────────────────────────
    const creditsIssued = await db.creditTransaction.aggregate({
      _sum: { amount: true },
      where: { amount: { gt: 0 } },
    })
    const creditsUsed = await db.creditTransaction.aggregate({
      _sum: { amount: true },
      where: { amount: { lt: 0 } },
    })

    // Total revenue from credit purchases
    const creditPurchases = await db.creditTransaction.aggregate({
      _sum: { amount: true },
      where: { type: 'purchase' },
    })

    const totalCreditsIssued = creditsIssued._sum.amount || 0
    const totalCreditsUsed = Math.abs(creditsUsed._sum.amount || 0)
    const totalRevenueFromCredits = creditPurchases._sum.amount || 0

    // ── 4. Revenue by Month (last 6 months) ───────────────────────
    const revenueByMonth = []
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      // Revenue from subscriptions
      const monthSubs = await db.subscription.findMany({
        where: {
          status: 'active',
          createdAt: { lt: mEnd },
        },
        include: {
          plan: { select: { price: true } },
        },
      })
      const subscriptionRevenue = monthSubs.reduce((sum, sub) => sum + sub.plan.price, 0)

      // Revenue from credit purchases
      const monthCreditPurchases = await db.creditTransaction.aggregate({
        _sum: { amount: true },
        where: {
          type: 'purchase',
          createdAt: { gte: mStart, lt: mEnd },
        },
      })
      const creditRevenue = monthCreditPurchases._sum.amount || 0

      // Won leads value
      const monthWonLeads = await db.lead.findMany({
        where: {
          status: 'won',
          createdAt: { gte: mStart, lt: mEnd },
        },
        select: { estimatedValue: true },
      })
      const leadsRevenue = monthWonLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)

      revenueByMonth.push({
        month: mStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        subscriptionRevenue,
        creditRevenue,
        leadsRevenue,
        totalRevenue: subscriptionRevenue + creditRevenue + leadsRevenue,
      })
    }

    // ── 5. Top Users ──────────────────────────────────────────────
    // Top users by leads
    const topUsersByLeadsRaw = await db.user.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        email: true,
        _count: { select: { leads: true } },
      },
      orderBy: { leads: { _count: 'desc' } },
      take: 10,
    })
    const topUsersByLeads = topUsersByLeadsRaw.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      leadCount: u._count.leads,
    }))

    // Top users by credits used
    const topUsersByCreditsRaw = await db.creditTransaction.groupBy({
      by: ['userId'],
      where: { amount: { lt: 0 } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'asc' } },
      take: 10,
    })
    const topUserIds = topUsersByCreditsRaw.map((t) => t.userId)
    const topCreditUsers = await db.user.findMany({
      where: { id: { in: topUserIds } },
      select: { id: true, name: true, email: true },
    })
    const topCreditUserMap = new Map(topCreditUsers.map((u) => [u.id, u]))
    const topUsersByCredits = topUsersByCreditsRaw.map((t) => ({
      id: t.userId,
      name: topCreditUserMap.get(t.userId)?.name || 'Unknown',
      email: topCreditUserMap.get(t.userId)?.email || 'Unknown',
      creditsUsed: Math.abs(t._sum.amount || 0),
    }))

    // ── 6. Platform Usage Stats ───────────────────────────────────
    const totalLeads = await db.lead.count()
    const totalSearches = await db.searchJob.count()
    const totalExports = await db.creditTransaction.count({
      where: { type: 'usage', description: { contains: 'export' } },
    })

    // Credit transactions by type
    const creditsByTypeRaw = await db.creditTransaction.groupBy({
      by: ['type'],
      _sum: { amount: true },
      _count: { type: true },
    })
    const creditsByType = creditsByTypeRaw.map((item) => ({
      type: item.type,
      totalAmount: item._sum.amount || 0,
      count: item._count.type,
    }))

    // Subscriptions by plan
    const subsByPlanRaw = await db.subscription.groupBy({
      by: ['planId'],
      _count: { planId: true },
      where: { status: 'active' },
    })
    const subsByPlan = subsByPlanRaw.map((item) => ({
      planId: item.planId,
      planName: planMap.get(item.planId) || 'Unknown',
      count: item._count.planId,
    }))

    return NextResponse.json({
      // User stats
      totalUsers,
      newUsersThisMonth,
      activeUsers,
      usersByRole,
      usersByPlan,

      // Subscription stats
      subscriptions: {
        active: activeSubscriptions,
        canceled: canceledSubscriptions,
        expired: expiredSubscriptions,
        pastDue: pastDueSubscriptions,
        mrr,
        byPlan: subsByPlan,
      },

      // Credit stats
      credits: {
        totalIssued: totalCreditsIssued,
        totalUsed: totalCreditsUsed,
        totalRevenueFromCredits,
        byType: creditsByType,
      },

      // Revenue
      revenueByMonth,

      // Top users
      topUsersByLeads,
      topUsersByCredits,

      // Platform usage
      platformUsage: {
        totalLeads,
        totalSearches,
        totalExports,
      },
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin analytics' },
      { status: 500 }
    )
  }
}
