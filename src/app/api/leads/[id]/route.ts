import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth/jwt'
import { applyRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = applyRateLimit(request, RATE_LIMITS.api)
  if (rl) return rateLimitResponse(rl)

  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { status, priority, notes, estimatedValue, lastContactedAt } = body

    // Check if lead exists and belongs to user (or user is admin)
    const existingLead = await db.lead.findUnique({
      where: { id },
    })

    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Ownership check: only owner or admin can update
    const isAdmin = ['super_admin', 'admin'].includes(authResult.payload.role)
    if (!isAdmin && existingLead.userId !== authResult.payload.sub) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Build update data with only provided fields
    const updateData: Record<string, unknown> = {}
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (notes !== undefined) updateData.notes = notes
    if (estimatedValue !== undefined) updateData.estimatedValue = estimatedValue
    if (lastContactedAt !== undefined) updateData.lastContactedAt = new Date(lastContactedAt)

    const lead = await db.lead.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Update lead error:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}
