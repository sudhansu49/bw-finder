import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where: Prisma.OutreachWhereInput = { userId: authResult.payload.sub }

    if (leadId) {
      where.leadId = leadId
    }

    if (type) {
      where.type = type
    }

    const [outreach, total] = await Promise.all([
      db.outreach.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          lead: {
            include: {
              business: true,
            },
          },
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
      db.outreach.count({ where }),
    ])

    return NextResponse.json({
      outreach,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get outreach error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch outreach entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await request.json()
    const { leadId, type, subject, notes, outcome } = body
    const userId = authResult.payload.sub

    if (!leadId) {
      return NextResponse.json(
        { error: 'leadId is required' },
        { status: 400 }
      )
    }

    // Verify lead exists
    const lead = await db.lead.findUnique({
      where: { id: leadId },
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    const outreach = await db.outreach.create({
      data: {
        leadId,
        userId,
        type: type || 'email',
        subject: subject || null,
        notes: notes || null,
        outcome: outcome || null,
      },
      include: {
        lead: {
          include: {
            business: true,
          },
        },
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

    // Update lead's lastContactedAt
    await db.lead.update({
      where: { id: leadId },
      data: { lastContactedAt: new Date() },
    })

    return NextResponse.json({ outreach }, { status: 201 })
  } catch (error) {
    console.error('Create outreach error:', error)
    return NextResponse.json(
      { error: 'Failed to create outreach entry' },
      { status: 500 }
    )
  }
}
