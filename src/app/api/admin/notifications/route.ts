import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const read = searchParams.get('read')
    const recipientId = searchParams.get('recipientId')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where: Prisma.NotificationWhereInput = {}

    if (type) {
      where.type = type
    }

    if (read !== null && read !== undefined && read !== '') {
      where.read = read === 'true'
    }

    if (recipientId) {
      where.recipientId = recipientId
    }

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
          recipient: {
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
      db.notification.count({ where }),
    ])

    return NextResponse.json({
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin get notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientId, recipientIds, type, title, message, actionUrl, senderId } = body

    // Support sending to a single recipient or multiple recipients
    const targetIds: string[] = []

    if (recipientIds && Array.isArray(recipientIds) && recipientIds.length > 0) {
      targetIds.push(...recipientIds)
    } else if (recipientId) {
      targetIds.push(recipientId)
    } else {
      return NextResponse.json(
        { error: 'recipientId or recipientIds is required' },
        { status: 400 }
      )
    }

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'type, title, and message are required' },
        { status: 400 }
      )
    }

    // Validate all recipients exist
    const recipients = await db.user.findMany({
      where: { id: { in: targetIds } },
      select: { id: true, name: true, email: true },
    })

    if (recipients.length !== targetIds.length) {
      const foundIds = recipients.map((r) => r.id)
      const missingIds = targetIds.filter((id) => !foundIds.includes(id))
      return NextResponse.json(
        { error: `Recipients not found: ${missingIds.join(', ')}` },
        { status: 404 }
      )
    }

    // Validate sender if provided
    if (senderId) {
      const sender = await db.user.findUnique({ where: { id: senderId } })
      if (!sender) {
        return NextResponse.json(
          { error: 'Sender not found' },
          { status: 404 }
        )
      }
    }

    // Create notifications for all recipients
    const notifications = await db.$transaction(
      targetIds.map((rId) =>
        db.notification.create({
          data: {
            senderId: senderId || null,
            recipientId: rId,
            type,
            title,
            message,
            actionUrl: actionUrl || null,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
            recipient: {
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
      )
    )

    return NextResponse.json(
      {
        data: notifications,
        sentCount: notifications.length,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin send notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
