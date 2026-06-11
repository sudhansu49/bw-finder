import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type ExportType = 'leads' | 'businesses' | 'audits' | 'pipeline'

const VALID_TYPES: ExportType[] = ['leads', 'businesses', 'audits', 'pipeline']

// ─── Data Fetchers ────────────────────────────────────────────────────────

interface FlatRow {
  [key: string]: unknown
}

async function fetchLeadsData(userId?: string | null, status?: string | null): Promise<FlatRow[]> {
  const where: Record<string, unknown> = {}
  if (userId) where.userId = userId
  if (status) where.status = status

  const leads = await db.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      business: {
        select: {
          name: true, category: true, city: true, state: true, country: true,
          phone: true, email: true, website: true, hasWebsite: true,
          leadScore: true, opportunityScore: true, estimatedMonthlyRevenue: true,
        },
      },
      user: { select: { name: true, email: true } },
      _count: { select: { leadNotes: true, leadTasks: true, outreach: true } },
    },
  })

  return leads.map(l => ({
    id: l.id,
    business_name: l.business.name,
    category: l.business.category,
    city: l.business.city || '',
    state: l.business.state || '',
    country: l.business.country || '',
    phone: l.business.phone || '',
    email: l.business.email || '',
    website: l.business.website || '',
    has_website: l.business.hasWebsite ? 'Yes' : 'No',
    lead_score: l.business.leadScore ?? '',
    opportunity_score: l.business.opportunityScore ?? '',
    est_monthly_revenue: l.business.estimatedMonthlyRevenue ?? '',
    status: l.status.replace(/_/g, ' '),
    priority: l.priority,
    estimated_value: l.estimatedValue ?? '',
    notes_count: l._count.leadNotes,
    tasks_count: l._count.leadTasks,
    outreach_count: l._count.outreach,
    assigned_to: l.user.name,
    last_contacted: l.lastContactedAt?.toISOString().split('T')[0] || '',
    created_at: l.createdAt.toISOString().split('T')[0],
    updated_at: l.updatedAt.toISOString().split('T')[0],
  }))
}

async function fetchBusinessesData(): Promise<FlatRow[]> {
  const businesses = await db.business.findMany({ orderBy: { createdAt: 'desc' } })

  return businesses.map(b => ({
    id: b.id,
    name: b.name,
    category: b.category,
    address: b.address || '',
    city: b.city || '',
    state: b.state || '',
    country: b.country || '',
    phone: b.phone || '',
    email: b.email || '',
    website: b.website || '',
    has_website: b.hasWebsite ? 'Yes' : 'No',
    website_status: b.websiteStatus || '',
    google_rating: b.googleRating ?? '',
    google_reviews: b.googleReviews ?? '',
    review_count: b.reviewCount ?? '',
    facebook_url: b.facebookUrl || '',
    instagram_url: b.instagramUrl || '',
    linkedin_url: b.linkedinUrl || '',
    social_presence: b.socialPresence,
    lead_score: b.leadScore ?? '',
    opportunity_score: b.opportunityScore ?? '',
    est_monthly_revenue: b.estimatedMonthlyRevenue ?? '',
    audit_score: b.auditScore ?? '',
    source: b.source,
    source_detail: b.sourceDetail || '',
    created_at: b.createdAt.toISOString().split('T')[0],
  }))
}

async function fetchAuditsData(): Promise<FlatRow[]> {
  const businesses = await db.business.findMany({
    where: { auditScore: { not: null } },
    orderBy: { auditScore: 'asc' },
    select: {
      id: true, name: true, category: true, city: true, country: true,
      phone: true, email: true, hasWebsite: true, websiteStatus: true,
      leadScore: true, opportunityScore: true, estimatedMonthlyRevenue: true,
      auditScore: true, auditDate: true, auditReport: true,
    },
  })

  return businesses.map(b => {
    let issues = ''
    let totalOppValue = 0
    let services = ''
    if (b.auditReport) {
      try {
        const report = JSON.parse(b.auditReport)
        issues = (report.items || []).map((i: { title: string; status: string }) => `${i.title} (${i.status})`).join('; ')
        totalOppValue = report.totalOpportunityValue || 0
        services = (report.servicesRecommended || []).join('; ')
      } catch { /* skip */ }
    }
    return {
      id: b.id,
      name: b.name,
      category: b.category,
      city: b.city || '',
      country: b.country || '',
      phone: b.phone || '',
      email: b.email || '',
      has_website: b.hasWebsite ? 'Yes' : 'No',
      website_status: b.websiteStatus || '',
      lead_score: b.leadScore ?? '',
      opportunity_score: b.opportunityScore ?? '',
      est_monthly_revenue: b.estimatedMonthlyRevenue ?? '',
      audit_score: b.auditScore ?? '',
      audit_date: b.auditDate?.toISOString().split('T')[0] || '',
      issues,
      total_opportunity_value: totalOppValue,
      services_recommended: services,
    }
  })
}

async function fetchPipelineData(userId?: string | null): Promise<FlatRow[]> {
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

  const rows: FlatRow[] = []
  for (const lead of leads) {
    rows.push({
      id: lead.id,
      business_name: lead.business.name,
      category: lead.business.category,
      city: lead.business.city || '',
      pipeline_stage: lead.status.replace(/_/g, ' '),
      priority: lead.priority,
      estimated_value: lead.estimatedValue ?? '',
      lead_score: lead.business.leadScore ?? '',
      opportunity_score: lead.business.opportunityScore ?? '',
      notes_count: lead._count.leadNotes,
      tasks_count: lead._count.leadTasks,
      last_contacted: lead.lastContactedAt?.toISOString().split('T')[0] || '',
      created_at: lead.createdAt.toISOString().split('T')[0],
    })
  }

  return rows
}

// ─── CSV Generator ────────────────────────────────────────────────────────

function generateCSV(data: FlatRow[]): string {
  if (data.length === 0) return ''
  const headers = Object.keys(data[0])
  const csvRows: string[] = [headers.join(',')]

  for (const row of data) {
    const values = headers.map(h => {
      const val = row[h]
      if (val === null || val === undefined) return ''
      const str = String(val)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })
    csvRows.push(values.join(','))
  }

  return csvRows.join('\n')
}

// ─── Main Handler ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = (searchParams.get('type') || 'leads') as ExportType
    const format = searchParams.get('format') || 'csv'
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Use: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Fetch data based on type
    let data: FlatRow[] = []
    let title = ''

    switch (type) {
      case 'leads':
        data = await fetchLeadsData(userId, status)
        title = 'Leads Export'
        break
      case 'businesses':
        data = await fetchBusinessesData()
        title = 'Businesses Export'
        break
      case 'audits':
        data = await fetchAuditsData()
        title = 'Audit Reports Export'
        break
      case 'pipeline':
        data = await fetchPipelineData(userId)
        title = 'Pipeline Export'
        break
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'No data found to export', count: 0 },
        { status: 404 }
      )
    }

    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `${type}_export_${dateStr}`

    // CSV - server-side generation
    if (format === 'csv') {
      const csv = generateCSV(data)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      })
    }

    // JSON - for client-side Excel/PDF generation
    return NextResponse.json({
      title,
      type,
      exportedAt: new Date().toISOString(),
      count: data.length,
      data,
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ─── Count endpoint for preview ───────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, userId, status } = body as { type: ExportType; userId?: string; status?: string }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    let count = 0

    switch (type) {
      case 'leads': {
        const where: Record<string, unknown> = {}
        if (userId) where.userId = userId
        if (status) where.status = status
        count = await db.lead.count({ where })
        break
      }
      case 'businesses': {
        count = await db.business.count()
        break
      }
      case 'audits': {
        count = await db.business.count({ where: { auditScore: { not: null } } })
        break
      }
      case 'pipeline': {
        const where: Record<string, unknown> = {}
        if (userId) where.userId = userId
        count = await db.lead.count({ where })
        break
      }
    }

    return NextResponse.json({ count, type })
  } catch (error) {
    console.error('Export count error:', error)
    return NextResponse.json({ error: 'Failed to count records' }, { status: 500 })
  }
}
