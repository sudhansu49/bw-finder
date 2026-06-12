import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const range = searchParams.get('range') || '30D'

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Compute date range filter
    const now = new Date()
    let startDate: Date | null = null
    let prevStartDate: Date | null = null

    switch (range) {
      case '7D':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        prevStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        break
      case '30D':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        prevStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
        break
      case '90D':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        prevStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      case 'All':
        startDate = null
        prevStartDate = null
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        prevStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    }

    const dateFilter = startDate ? { createdAt: { gte: startDate } } : {}
    const prevDateFilter = prevStartDate && startDate
      ? { createdAt: { gte: prevStartDate, lt: startDate } }
      : {}

    // ── 1. Current Period Lead Counts ──────────────────────────────────
    const leadWhere = { userId, ...dateFilter }
    const prevLeadWhere = { userId, ...prevDateFilter }

    const [
      totalLeads,
      wonLeads,
      prevTotalLeads,
      prevWonLeads,
    ] = await Promise.all([
      db.lead.count({ where: leadWhere }),
      db.lead.count({ where: { ...leadWhere, status: 'won' } }),
      db.lead.count({ where: prevLeadWhere }),
      db.lead.count({ where: { ...prevLeadWhere, status: 'won' } }),
    ])

    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0
    const prevConversionRate = prevTotalLeads > 0 ? (prevWonLeads / prevTotalLeads) * 100 : 0

    // ── 2. Revenue Data ──────────────────────────────────────────────
    const [wonLeadsData, prevWonLeadsData] = await Promise.all([
      db.lead.findMany({
        where: { ...leadWhere, status: 'won' },
        select: { estimatedValue: true },
      }),
      db.lead.findMany({
        where: { ...prevLeadWhere, status: 'won' },
        select: { estimatedValue: true },
      }),
    ])

    const revenueGenerated = wonLeadsData.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)
    const prevRevenue = prevWonLeadsData.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)

    // ── 3. Outreach Stats ────────────────────────────────────────────
    const outreachWhere = { userId, ...dateFilter }
    const prevOutreachWhere = { userId, ...prevDateFilter }

    const [totalOutreach, prevTotalOutreach] = await Promise.all([
      db.outreach.count({ where: outreachWhere }),
      db.outreach.count({ where: prevOutreachWhere }),
    ])

    // ── 4. Compute Trends ────────────────────────────────────────────
    const leadsTrend = prevTotalLeads > 0
      ? Math.round(((totalLeads - prevTotalLeads) / prevTotalLeads) * 1000) / 10
      : totalLeads > 0 ? 100 : 0
    const conversionTrend = prevConversionRate > 0
      ? Math.round(((conversionRate - prevConversionRate) / prevConversionRate) * 1000) / 10
      : conversionRate > 0 ? 100 : 0
    const revenueTrend = prevRevenue > 0
      ? Math.round(((revenueGenerated - prevRevenue) / prevRevenue) * 1000) / 10
      : revenueGenerated > 0 ? 100 : 0
    const outreachTrend = prevTotalOutreach > 0
      ? Math.round(((totalOutreach - prevTotalOutreach) / prevTotalOutreach) * 1000) / 10
      : totalOutreach > 0 ? 100 : 0

    // ── 5. Lead Trend Data ──────────────────────────────────────────
    // Build time-series data for lead trend chart
    const leadTrend: { date: string; leads: number; qualified: number }[] = []

    if (range === '7D') {
      // Daily data for 7 days
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
        const dayLabel = dayStart.toLocaleDateString('en-US', { weekday: 'short' })

        const [dayLeads, dayQualified] = await Promise.all([
          db.lead.count({
            where: { userId, createdAt: { gte: dayStart, lt: dayEnd } },
          }),
          db.lead.count({
            where: { userId, status: { in: ['qualified', 'proposal', 'won'] }, createdAt: { gte: dayStart, lt: dayEnd } },
          }),
        ])

        leadTrend.push({ date: dayLabel, leads: dayLeads, qualified: dayQualified })
      }
    } else if (range === '30D') {
      // Weekly data for 30 days
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
        const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000)
        const weekLabel = `W${4 - i}`

        const [weekLeads, weekQualified] = await Promise.all([
          db.lead.count({
            where: { userId, createdAt: { gte: weekStart, lt: weekEnd } },
          }),
          db.lead.count({
            where: { userId, status: { in: ['qualified', 'proposal', 'won'] }, createdAt: { gte: weekStart, lt: weekEnd } },
          }),
        ])

        leadTrend.push({ date: weekLabel, leads: weekLeads, qualified: weekQualified })
      }
    } else {
      // Monthly data for 90D or All
      const months = range === '90D' ? 6 : 12
      for (let i = months - 1; i >= 0; i--) {
        const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        const mLabel = mStart.toLocaleDateString('en-US', { month: 'short' })

        const [mLeads, mQualified] = await Promise.all([
          db.lead.count({
            where: { userId, createdAt: { gte: mStart, lt: mEnd } },
          }),
          db.lead.count({
            where: { userId, status: { in: ['qualified', 'proposal', 'won'] }, createdAt: { gte: mStart, lt: mEnd } },
          }),
        ])

        leadTrend.push({ date: mLabel, leads: mLeads, qualified: mQualified })
      }
    }

    // ── 6. Outreach Performance ─────────────────────────────────────
    const outreachTypes = ['email', 'phone', 'whatsapp'] as const
    const outreachPerformance: { channel: string; sent: number; opened: number; replied: number; bounced: number }[] = []

    for (const type of outreachTypes) {
      const [sent, opened, replied, bounced] = await Promise.all([
        db.outreach.count({ where: { ...outreachWhere, type } }),
        db.outreach.count({ where: { ...outreachWhere, type, outcome: 'interested' } }),
        db.outreach.count({ where: { ...outreachWhere, type, outcome: 'replied' } }),
        db.outreach.count({ where: { ...outreachWhere, type, outcome: 'bounced' } }),
      ])

      outreachPerformance.push({
        channel: type.charAt(0).toUpperCase() + type.slice(1),
        sent,
        opened,
        replied,
        bounced,
      })
    }

    // ── 7. Revenue by Category ──────────────────────────────────────
    const leads = await db.lead.findMany({
      where: leadWhere,
      select: {
        id: true,
        status: true,
        priority: true,
        estimatedValue: true,
        businessId: true,
        createdAt: true,
      },
    })

    const businessIds = [...new Set(leads.map((l) => l.businessId))]
    const businesses = await db.business.findMany({
      where: { id: { in: businessIds } },
      select: { id: true, name: true, category: true, leadScore: true },
    })
    const businessMap = new Map(businesses.map((b) => [b.id, b]))

    const categoryBreakdown: Record<string, { count: number; value: number }> = {}
    for (const lead of leads) {
      const business = businessMap.get(lead.businessId)
      const category = business?.category || 'Uncategorized'
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { count: 0, value: 0 }
      }
      categoryBreakdown[category].count++
      categoryBreakdown[category].value += lead.estimatedValue || 0
    }

    const revenueByCategory = Object.entries(categoryBreakdown)
      .map(([category, data]) => ({
        category,
        revenue: data.value,
        count: data.count,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // ── 8. Lead Score Distribution ──────────────────────────────────
    const allBusinessScores = businesses
      .filter((b) => b.leadScore !== null && b.leadScore !== undefined)
      .map((b) => b.leadScore as number)

    const scoreRanges = [
      { range: '0-10', min: 0, max: 10, label: 'Cold' },
      { range: '11-20', min: 11, max: 20, label: 'Cold' },
      { range: '21-30', min: 21, max: 30, label: 'Cool' },
      { range: '31-40', min: 31, max: 40, label: 'Cool' },
      { range: '41-50', min: 41, max: 50, label: 'Warm' },
      { range: '51-60', min: 51, max: 60, label: 'Warm' },
      { range: '61-70', min: 61, max: 70, label: 'Hot' },
      { range: '71-80', min: 71, max: 80, label: 'Hot' },
      { range: '81-90', min: 81, max: 90, label: 'Prime' },
      { range: '91-100', min: 91, max: 100, label: 'Prime' },
    ]

    const leadScoreDistribution = scoreRanges.map((sr) => ({
      range: sr.range,
      count: allBusinessScores.filter((s) => s >= sr.min && s <= sr.max).length,
      label: sr.label,
    }))

    // ── 9. Recent Leads ─────────────────────────────────────────────
    const recentLeadsRaw = await db.lead.findMany({
      where: leadWhere,
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        business: {
          select: { name: true, category: true },
        },
        outreach: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { type: true },
        },
      },
    })

    const recentLeads = recentLeadsRaw.map((lead) => ({
      id: lead.id,
      business: {
        name: lead.business.name,
        category: lead.business.category,
      },
      leadScore: businessMap.get(lead.businessId)?.leadScore || 0,
      status: lead.status,
      estimatedValue: lead.estimatedValue || 0,
      createdAt: lead.createdAt.toISOString(),
      outreachType: lead.outreach[0]?.type || null,
    }))

    // ── 10. Priority Distribution ───────────────────────────────────
    const priorityRaw = await db.lead.groupBy({
      by: ['priority'],
      where: leadWhere,
      _count: { priority: true },
    })
    const priorityDistribution = priorityRaw.map((item) => ({
      priority: item.priority,
      count: item._count.priority,
    }))

    // ── 11. Monthly Trend ───────────────────────────────────────────
    const trendMonths = range === '7D' ? 1 : range === '30D' ? 3 : range === '90D' ? 6 : 12
    const monthlyTrend: { month: string; leads: number; converted: number }[] = []
    for (let i = trendMonths - 1; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const [monthLeads, monthWon] = await Promise.all([
        db.lead.count({
          where: { userId, createdAt: { gte: mStart, lt: mEnd } },
        }),
        db.lead.count({
          where: { userId, status: 'won', createdAt: { gte: mStart, lt: mEnd } },
        }),
      ])

      monthlyTrend.push({
        month: mStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        leads: monthLeads,
        converted: monthWon,
      })
    }

    // ── Build Response ──────────────────────────────────────────────
    return NextResponse.json({
      range,
      kpi: {
        totalLeads,
        conversionRate: Math.round(conversionRate * 10) / 10,
        revenueGenerated,
        outreachSent: totalOutreach,
        leadsTrend,
        conversionTrend,
        revenueTrend,
        outreachTrend,
      },
      leadTrend,
      outreachPerformance,
      revenueByCategory,
      leadScoreDistribution,
      recentLeads,
      priorityDistribution,
      monthlyTrend,
    })
  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    )
  }
}
