import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/auth/jwt'
import { applyRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export async function GET(request: NextRequest) {
  // Rate limiting
  const rl = applyRateLimit(request, RATE_LIMITS.api)
  if (rl) return rateLimitResponse(rl)

  // Auth check
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where: Prisma.LeadWhereInput = { userId: authResult.payload.sub }

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
    }

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          business: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
            },
          },
        },
      }),
      db.lead.count({ where }),
    ])

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get leads error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rl = applyRateLimit(request, RATE_LIMITS.api)
  if (rl) return rateLimitResponse(rl)

  // Auth check - get userId from JWT instead of request body
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await request.json()
    const { businessId, status, priority, estimatedValue, notes } = body
    const userId = authResult.payload.sub // Always use JWT subject as userId

    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId is required' },
        { status: 400 }
      )
    }

    // Verify business exists
    const business = await db.business.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Check for existing lead (same user + business)
    const existingLead = await db.lead.findFirst({
      where: { businessId, userId },
    })

    if (existingLead) {
      return NextResponse.json(
        { error: 'Lead already exists for this business', lead: existingLead },
        { status: 409 }
      )
    }

    const lead = await db.lead.create({
      data: {
        businessId,
        userId,
        status: status || 'new_lead',
        priority: priority || 'medium',
        estimatedValue: estimatedValue ?? null,
        notes: notes || null,
      },
      include: {
        business: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
      },
    })

    return NextResponse.json({ lead }, { status: 201 })
  } catch (error) {
    console.error('Create lead error:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
