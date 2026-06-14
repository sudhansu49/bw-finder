import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const userFilter = userId ? { userId } : {}

    // ── 1. Total Leads ─────────────────────────────────────────────
    const totalLeads = await db.lead.count({ where: userFilter })

    const leadsByStatusRaw = await db.lead.groupBy({
      by: ['status'],
      _count: { status: true },
      where: userFilter,
    })

    const statusLabels: Record<string, string> = {
      new_lead: 'New Lead',
      new: 'New',
      contacted: 'Contacted',
      interested: 'Interested',
      qualified: 'Qualified',
      meeting_scheduled: 'Meeting',
      proposal: 'Proposal',
      proposal_sent: 'Proposal Sent',
      negotiation: 'Negotiation',
      won: 'Won',
      lost: 'Lost',
    }

    const leadsByStatus = leadsByStatusRaw.map((item) => ({
      status: statusLabels[item.status] || item.status,
      rawStatus: item.status,
      count: item._count.status,
    }))

    // ── 2. No Website Leads ────────────────────────────────────────
    const totalBusinesses = await db.business.count()
    const noWebsiteBusinesses = await db.business.count({
      where: { hasWebsite: false },
    })
    const noWebsiteLeads = await db.lead.count({
      where: {
        ...userFilter,
        business: { hasWebsite: false },
      },
    })

    // Website status breakdown
    const websiteStatusBreakdown = await db.business.groupBy({
      by: ['websiteStatus'],
      _count: { websiteStatus: true },
    })

    // ── 3. High Opportunity Leads ──────────────────────────────────
    const highOpportunityLeads = await db.lead.count({
      where: {
        ...userFilter,
        business: { opportunityScore: { gte: 70 } },
      },
    })

    const mediumOpportunityLeads = await db.lead.count({
      where: {
        ...userFilter,
        business: { opportunityScore: { gte: 40, lt: 70 } },
      },
    })

    const lowOpportunityLeads = await db.lead.count({
      where: {
        ...userFilter,
        business: { opportunityScore: { lt: 40 } },
      },
    })

    // Top opportunity leads
    const topOpportunityLeads = await db.lead.findMany({
      where: {
        ...userFilter,
        business: { opportunityScore: { not: null } },
      },
      orderBy: { business: { opportunityScore: 'desc' } },
      take: 8,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            category: true,
            city: true,
            hasWebsite: true,
            leadScore: true,
            opportunityScore: true,
            estimatedMonthlyRevenue: true,
          },
        },
      },
    })

    // ── 4. Revenue Potential ───────────────────────────────────────
    const wonLeads = await db.lead.findMany({
      where: { status: 'won', ...userFilter },
      select: { estimatedValue: true },
    })
    const wonDealsValue = wonLeads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0)

    const activeLeadsValue = await db.lead.aggregate({
      _sum: { estimatedValue: true },
      where: {
        status: { notIn: ['won', 'lost'] },
        ...userFilter,
      },
    })

    const allLeadsValue = await db.lead.aggregate({
      _sum: { estimatedValue: true },
      where: userFilter,
    })

    // Revenue by month (last 6 months)
    const now = new Date()
    const revenueByMonth = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthLeads = await db.lead.findMany({
        where: {
          status: 'won',
          createdAt: { gte: monthStart, lt: monthEnd },
          ...userFilter,
        },
        select: { estimatedValue: true },
      })
      const monthValue = monthLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)
      revenueByMonth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthValue,
        deals: monthLeads.length,
      })
    }

    // Estimated revenue from scored businesses
    const scoredBusinesses = await db.business.findMany({
      where: { leadScore: { not: null } },
      select: { leadScore: true, opportunityScore: true, estimatedMonthlyRevenue: true },
    })
    const totalEstimatedRevenue = scoredBusinesses.reduce((sum, b) => sum + (b.estimatedMonthlyRevenue || 0), 0)

    // ── 5. Conversion Metrics ─────────────────────────────────────
    const activeLeads = await db.lead.count({
      where: {
        status: { notIn: ['won', 'lost'] },
        ...userFilter,
      },
    })

    const wonLeadsCount = await db.lead.count({
      where: { status: 'won', ...userFilter },
    })

    const lostLeadsCount = await db.lead.count({
      where: { status: 'lost', ...userFilter },
    })

    // Overall conversion rate
    const conversionRate = totalLeads > 0
      ? Math.round((wonLeadsCount / totalLeads) * 100)
      : 0

    // Pipeline conversion funnel
    const funnelStages = [
      { stage: 'New Lead', statuses: ['new_lead', 'new'] },
      { stage: 'Contacted', statuses: ['contacted'] },
      { stage: 'Interested', statuses: ['interested', 'qualified'] },
      { stage: 'Meeting', statuses: ['meeting_scheduled'] },
      { stage: 'Proposal', statuses: ['proposal', 'proposal_sent', 'negotiation'] },
      { stage: 'Won', statuses: ['won'] },
    ]

    const funnelData = []
    for (const funnelStage of funnelStages) {
      const count = leadsByStatusRaw
        .filter(l => funnelStage.statuses.includes(l.status))
        .reduce((sum, l) => sum + l._count.status, 0)
      funnelData.push({
        stage: funnelStage.stage,
        count,
      })
    }

    // Stage-to-stage conversion rates
    const stageConversions: { from: string; to: string; rate: number }[] = []
    for (let i = 0; i < funnelData.length - 1; i++) {
      const current = funnelData[i].count
      const next = funnelData[i + 1].count
      const rate = current > 0 ? Math.round((next / current) * 100) : 0
      stageConversions.push({
        from: funnelData[i].stage,
        to: funnelData[i + 1].stage,
        rate,
      })
    }

    // Average deal cycle (days from creation to won)
    const wonLeadsWithDates = await db.lead.findMany({
      where: { status: 'won', ...userFilter },
      select: { createdAt: true, updatedAt: true },
    })
    const avgDealCycle = wonLeadsWithDates.length > 0
      ? Math.round(
          wonLeadsWithDates.reduce((sum, l) => {
            const days = (l.updatedAt.getTime() - l.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            return sum + days
          }, 0) / wonLeadsWithDates.length
        )
      : 0

    // ── Supporting data ─────────────────────────────────────────────
    const businessesByCategory = (await db.business.groupBy({
      by: ['category'],
      _count: { category: true },
    })).map(item => ({ category: item.category, count: item._count.category }))

    const businessesByCountry = (await db.business.groupBy({
      by: ['country'],
      _count: { country: true },
      where: { country: { not: null } },
    }))
    .filter(item => item.country !== null)
    .map(item => ({ country: item.country || 'Unknown', count: item._count.country }))

    const recentLeadsRaw = await db.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: userFilter,
      include: {
        business: { select: { name: true, category: true, city: true, country: true } },
      },
    })
    const recentLeads = recentLeadsRaw.map(lead => ({
      id: lead.id,
      business: lead.business,
      status: statusLabels[lead.status] || lead.status,
      estimatedValue: lead.estimatedValue || 0,
      priority: lead.priority,
    }))

    // Search stats
    const totalSearches = await db.searchJob.count()
    const completedSearches = await db.searchJob.count({ where: { status: 'completed' } })

    // Scoring averages
    const avgLeadScore = scoredBusinesses.length > 0
      ? Math.round(scoredBusinesses.reduce((sum, b) => sum + (b.leadScore || 0), 0) / scoredBusinesses.length)
      : 0
    const avgOpportunityScore = scoredBusinesses.length > 0
      ? Math.round(scoredBusinesses.reduce((sum, b) => sum + (b.opportunityScore || 0), 0) / scoredBusinesses.length)
      : 0

    // Audit stats
    const auditedBusinesses = await db.business.findMany({
      where: { auditScore: { not: null } },
      select: { auditScore: true, auditReport: true },
    })
    const avgAuditScore = auditedBusinesses.length > 0
      ? Math.round(auditedBusinesses.reduce((sum, b) => sum + (b.auditScore || 0), 0) / auditedBusinesses.length)
      : 0

    let totalAuditOpportunityValue = 0
    const auditIssueCounts: Record<string, number> = { critical: 0, warning: 0, opportunity: 0, good: 0 }
    for (const b of auditedBusinesses) {
      if (b.auditReport) {
        try {
          const report = JSON.parse(b.auditReport)
          totalAuditOpportunityValue += report.totalOpportunityValue || 0
          if (report.items) {
            for (const item of report.items) {
              if (auditIssueCounts[item.status] !== undefined) {
                auditIssueCounts[item.status]++
              }
            }
          }
        } catch { /* skip */ }
      }
    }

    const topAuditOpportunities = await db.business.findMany({
      where: { auditScore: { not: null } },
      orderBy: { auditScore: 'asc' },
      take: 5,
      select: { id: true, name: true, category: true, city: true, auditScore: true, leadScore: true },
    })

    return NextResponse.json({
      // Core metrics
      totalLeads,
      totalBusinesses,
      noWebsiteBusinesses,
      noWebsiteLeads,
      highOpportunityLeads,
      mediumOpportunityLeads,
      lowOpportunityLeads,
      activeLeads,
      wonLeadsCount,
      lostLeadsCount,
      wonDealsValue,

      // Revenue
      pipelineValue: activeLeadsValue._sum.estimatedValue || 0,
      totalLeadsValue: allLeadsValue._sum.estimatedValue || 0,
      totalEstimatedRevenue,
      revenueByMonth,

      // Conversion
      conversionRate,
      avgDealCycle,
      funnelData,
      stageConversions,

      // Charts
      leadsByStatus,
      businessesByCategory,
      businessesByCountry,
      websiteStatusBreakdown: websiteStatusBreakdown.map(item => ({
        status: item.websiteStatus || 'unknown',
        count: item._count.websiteStatus,
      })),

      // Lists
      recentLeads,
      topOpportunityLeads,

      // Scoring
      scoringStats: {
        avgLeadScore,
        avgOpportunityScore,
        totalEstimatedRevenue,
        scoredCount: scoredBusinesses.length,
      },

      // Audit
      auditStats: {
        auditedCount: auditedBusinesses.length,
        avgAuditScore,
        totalOpportunityValue: totalAuditOpportunityValue,
        criticalIssues: auditIssueCounts.critical,
        warningIssues: auditIssueCounts.warning,
        opportunities: auditIssueCounts.opportunity,
      },
      topAuditOpportunities,

      // Search
      searchStats: { totalSearches, completedSearches },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
