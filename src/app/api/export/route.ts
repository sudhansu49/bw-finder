import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'leads'
    const format = searchParams.get('format') || 'csv'
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    if (!['leads', 'businesses', 'audits', 'pipeline'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Use: leads, businesses, audits, pipeline' }, { status: 400 })
    }

    if (!['csv', 'json'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format. Use: csv or json' }, { status: 400 })
    }

    let data: Record<string, unknown>[] = []
    let filename = ''

    switch (type) {
      case 'leads': {
        const where: Record<string, unknown> = {}
        if (userId) where.userId = userId
        if (status) where.status = status

        const leads = await db.lead.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            business: {
              select: {
                name: true,
                category: true,
                city: true,
                state: true,
                country: true,
                phone: true,
                email: true,
                website: true,
                hasWebsite: true,
                leadScore: true,
                opportunityScore: true,
                estimatedMonthlyRevenue: true,
              },
            },
            user: { select: { name: true, email: true } },
            _count: { select: { leadNotes: true, leadTasks: true, outreach: true } },
          },
        })

        data = leads.map(l => ({
          id: l.id,
          business_name: l.business.name,
          category: l.business.category,
          city: l.business.city,
          state: l.business.state,
          country: l.business.country,
          phone: l.business.phone,
          email: l.business.email,
          website: l.business.website,
          has_website: l.business.hasWebsite,
          lead_score: l.business.leadScore,
          opportunity_score: l.business.opportunityScore,
          estimated_monthly_revenue: l.business.estimatedMonthlyRevenue,
          status: l.status,
          priority: l.priority,
          estimated_value: l.estimatedValue,
          notes_count: l._count.leadNotes,
          tasks_count: l._count.leadTasks,
          outreach_count: l._count.outreach,
          assigned_to: l.user.name,
          last_contacted: l.lastContactedAt?.toISOString() || '',
          created_at: l.createdAt.toISOString(),
          updated_at: l.updatedAt.toISOString(),
        }))
        filename = `leads_export_${new Date().toISOString().split('T')[0]}`
        break
      }

      case 'businesses': {
        const businesses = await db.business.findMany({
          orderBy: { createdAt: 'desc' },
        })

        data = businesses.map(b => ({
          id: b.id,
          name: b.name,
          category: b.category,
          address: b.address,
          city: b.city,
          state: b.state,
          country: b.country,
          phone: b.phone,
          email: b.email,
          website: b.website,
          has_website: b.hasWebsite,
          website_status: b.websiteStatus,
          google_rating: b.googleRating,
          google_reviews: b.googleReviews,
          review_count: b.reviewCount,
          facebook_url: b.facebookUrl,
          instagram_url: b.instagramUrl,
          linkedin_url: b.linkedinUrl,
          social_presence: b.socialPresence,
          lead_score: b.leadScore,
          opportunity_score: b.opportunityScore,
          estimated_monthly_revenue: b.estimatedMonthlyRevenue,
          audit_score: b.auditScore,
          source: b.source,
          source_detail: b.sourceDetail,
          created_at: b.createdAt.toISOString(),
          updated_at: b.updatedAt.toISOString(),
        }))
        filename = `businesses_export_${new Date().toISOString().split('T')[0]}`
        break
      }

      case 'audits': {
        const businesses = await db.business.findMany({
          where: { auditScore: { not: null } },
          orderBy: { auditScore: 'asc' },
          select: {
            id: true,
            name: true,
            category: true,
            city: true,
            country: true,
            phone: true,
            email: true,
            hasWebsite: true,
            websiteStatus: true,
            leadScore: true,
            opportunityScore: true,
            estimatedMonthlyRevenue: true,
            auditScore: true,
            auditDate: true,
            auditReport: true,
          },
        })

        data = businesses.map(b => {
          let auditItems: string[] = []
          let totalOppValue = 0
          let services: string[] = []
          if (b.auditReport) {
            try {
              const report = JSON.parse(b.auditReport)
              auditItems = (report.items || []).map((i: { title: string; status: string }) => `${i.title} (${i.status})`)
              totalOppValue = report.totalOpportunityValue || 0
              services = report.servicesRecommended || []
            } catch { /* skip */ }
          }
          return {
            id: b.id,
            name: b.name,
            category: b.category,
            city: b.city,
            country: b.country,
            has_website: b.hasWebsite,
            website_status: b.websiteStatus,
            lead_score: b.leadScore,
            opportunity_score: b.opportunityScore,
            estimated_monthly_revenue: b.estimatedMonthlyRevenue,
            audit_score: b.auditScore,
            audit_date: b.auditDate?.toISOString() || '',
            issues: auditItems.join('; '),
            total_opportunity_value: totalOppValue,
            services_recommended: services.join('; '),
          }
        })
        filename = `audits_export_${new Date().toISOString().split('T')[0]}`
        break
      }

      case 'pipeline': {
        const where: Record<string, unknown> = {}
        if (userId) where.userId = userId

        const leads = await db.lead.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            business: { select: { name: true, category: true, city: true, leadScore: true, opportunityScore: true } },
            _count: { select: { leadNotes: true, leadTasks: true } },
          },
        })

        const stages = ['new_lead', 'contacted', 'interested', 'meeting_scheduled', 'proposal_sent', 'won', 'lost']
        const stageData = stages.map(stage => {
          const stageLeads = leads.filter(l => l.status === stage)
          return {
            stage,
            count: stageLeads.length,
            total_value: stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
            leads: stageLeads.map(l => ({
              id: l.id,
              business_name: l.business.name,
              category: l.business.category,
              city: l.business.city,
              priority: l.priority,
              estimated_value: l.estimatedValue,
              lead_score: l.business.leadScore,
              created_at: l.createdAt.toISOString(),
            })),
          }
        })

        data = [{
          total_leads: leads.length,
          total_pipeline_value: leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
          won_value: leads.filter(l => l.status === 'won').reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
          conversion_rate: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'won').length / leads.length) * 100) : 0,
          stages: stageData,
        }]
        filename = `pipeline_export_${new Date().toISOString().split('T')[0]}`
        break
      }
    }

    // Return JSON format
    if (format === 'json') {
      return NextResponse.json(data, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}.json"`,
        },
      })
    }

    // Generate CSV
    if (data.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 404 })
    }

    // Flatten nested objects for CSV
    const flatData = type === 'pipeline'
      ? data // Pipeline is already structured
      : data

    const headers = Object.keys(flatData[0] as Record<string, unknown>)
    const csvRows: string[] = [headers.join(',')]

    for (const row of flatData) {
      const values = headers.map(h => {
        const val = (row as Record<string, unknown>)[h]
        if (val === null || val === undefined) return ''
        const str = String(val)
        // Escape CSV values containing commas, quotes, or newlines
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      csvRows.push(values.join(','))
    }

    const csvContent = csvRows.join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}
