import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Total businesses
    const totalBusinesses = await db.business.count()

    // Businesses without website
    const withoutWebsite = await db.business.count({
      where: { hasWebsite: false },
    })

    // Active leads (not won or lost)
    const activeLeads = await db.lead.count({
      where: {
        status: { in: ['new', 'contacted', 'qualified', 'proposal', 'negotiation'] },
        ...(userId ? { userId } : {}),
      },
    })

    // Leads won value
    const wonLeads = await db.lead.findMany({
      where: { status: 'won' },
      select: { estimatedValue: true },
    })
    const wonDealsValue = wonLeads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0)

    // Leads by status - transform to array format for charts
    const leadsByStatusRaw = await db.lead.groupBy({
      by: ['status'],
      _count: { status: true },
      ...(userId ? { where: { userId } } : {}),
    })

    const statusLabels: Record<string, string> = {
      new: 'New',
      contacted: 'Contacted',
      qualified: 'Qualified',
      proposal: 'Proposal',
      negotiation: 'Negotiation',
      won: 'Won',
      lost: 'Lost',
    }

    const leadsByStatus = leadsByStatusRaw.map((item) => ({
      status: statusLabels[item.status] || item.status,
      count: item._count.status,
    }))

    // Businesses by category - transform to array format for charts
    const businessesByCategoryRaw = await db.business.groupBy({
      by: ['category'],
      _count: { category: true },
    })

    const businessesByCategory = businessesByCategoryRaw.map((item) => ({
      category: item.category,
      count: item._count.category,
    }))

    // Businesses by country
    const businessesByCountryRaw = await db.business.groupBy({
      by: ['country'],
      _count: { country: true },
      where: { country: { not: null } },
    })

    const businessesByCountry = businessesByCountryRaw
      .filter((item) => item.country !== null)
      .map((item) => ({
        country: item.country || 'Unknown',
        count: item._count.country,
      }))

    // Recent leads
    const recentLeadsRaw = await db.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: userId ? { userId } : {},
      include: {
        business: {
          select: { name: true, category: true, city: true, country: true },
        },
      },
    })

    const recentLeads = recentLeadsRaw.map((lead) => ({
      id: lead.id,
      business: lead.business,
      status: statusLabels[lead.status] || lead.status,
      estimatedValue: lead.estimatedValue || 0,
      priority: lead.priority,
    }))

    // Search jobs stats
    const totalSearches = await db.searchJob.count()
    const completedSearches = await db.searchJob.count({
      where: { status: 'completed' },
    })

    // Lead scoring stats
    const scoredBusinesses = await db.business.findMany({
      where: { leadScore: { not: null } },
      select: { leadScore: true, opportunityScore: true, estimatedMonthlyRevenue: true },
    })

    const avgLeadScore = scoredBusinesses.length > 0
      ? Math.round(scoredBusinesses.reduce((sum, b) => sum + (b.leadScore || 0), 0) / scoredBusinesses.length)
      : 0

    const avgOpportunityScore = scoredBusinesses.length > 0
      ? Math.round(scoredBusinesses.reduce((sum, b) => sum + (b.opportunityScore || 0), 0) / scoredBusinesses.length)
      : 0

    const totalEstimatedRevenue = scoredBusinesses.reduce((sum, b) => sum + (b.estimatedMonthlyRevenue || 0), 0)

    // Top scored businesses (high lead score, no website)
    const topScoringBusinesses = await db.business.findMany({
      where: { leadScore: { not: null }, hasWebsite: false },
      orderBy: { leadScore: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        category: true,
        city: true,
        leadScore: true,
        opportunityScore: true,
        estimatedMonthlyRevenue: true,
      },
    })

    // Website status breakdown
    const websiteStatusBreakdown = await db.business.groupBy({
      by: ['websiteStatus'],
      _count: { websiteStatus: true },
    })

    return NextResponse.json({
      totalBusinesses,
      withoutWebsite,
      activeLeads,
      wonDealsValue,
      leadsByStatus,
      businessesByCategory,
      businessesByCountry,
      recentLeads,
      searchStats: {
        totalSearches,
        completedSearches,
      },
      scoringStats: {
        avgLeadScore,
        avgOpportunityScore,
        totalEstimatedRevenue,
        scoredCount: scoredBusinesses.length,
      },
      topScoringBusinesses,
      websiteStatusBreakdown: websiteStatusBreakdown.map(item => ({
        status: item.websiteStatus || 'unknown',
        count: item._count.websiteStatus,
      })),
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
