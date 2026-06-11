import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where: Prisma.SupportTicketWhereInput = {}

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
    }

    if (category) {
      where.category = category
    }

    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
        },
      }),
      db.supportTicket.count({ where }),
    ])

    return NextResponse.json({
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin get support tickets error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch support tickets' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticketId, status, assigneeId, priority, resolution } = body

    if (!ticketId) {
      return NextResponse.json(
        { error: 'ticketId is required' },
        { status: 400 }
      )
    }

    const ticket = await db.supportTicket.findUnique({ where: { id: ticketId } })
    if (!ticket) {
      return NextResponse.json(
        { error: 'Support ticket not found' },
        { status: 404 }
      )
    }

    // Validate assignee if provided
    if (assigneeId !== undefined && assigneeId !== null) {
      const assignee = await db.user.findUnique({ where: { id: assigneeId } })
      if (!assignee) {
        return NextResponse.json(
          { error: 'Assignee user not found' },
          { status: 404 }
        )
      }
    }

    const updateData: Prisma.SupportTicketUpdateInput = {}
    if (status !== undefined) updateData.status = status
    if (assigneeId !== undefined) {
      updateData.assignee = assigneeId === null
        ? { disconnect: true }
        : { connect: { id: assigneeId } }
    }
    if (priority !== undefined) updateData.priority = priority
    if (resolution !== undefined) updateData.resolution = resolution

    const updatedTicket = await db.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json({ data: updatedTicket })
  } catch (error) {
    console.error('Admin update support ticket error:', error)
    return NextResponse.json(
      { error: 'Failed to update support ticket' },
      { status: 500 }
    )
  }
}
