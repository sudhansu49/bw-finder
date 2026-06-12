import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { type, subject, notes, outcome } = body

    // Check if outreach entry exists
    const existing = await db.outreach.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Outreach entry not found' },
        { status: 404 }
      )
    }

    // Build update data with only provided fields
    const updateData: Record<string, unknown> = {}
    if (type !== undefined) updateData.type = type
    if (subject !== undefined) updateData.subject = subject
    if (notes !== undefined) updateData.notes = notes
    if (outcome !== undefined) updateData.outcome = outcome

    const outreach = await db.outreach.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ outreach })
  } catch (error) {
    console.error('Update outreach error:', error)
    return NextResponse.json(
      { error: 'Failed to update outreach entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if outreach entry exists
    const existing = await db.outreach.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Outreach entry not found' },
        { status: 404 }
      )
    }

    await db.outreach.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete outreach error:', error)
    return NextResponse.json(
      { error: 'Failed to delete outreach entry' },
      { status: 500 }
    )
  }
}
