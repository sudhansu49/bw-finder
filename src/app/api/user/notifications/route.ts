import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const userId = authResult.payload.sub
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const where = {
      recipientId: userId,
      ...(unreadOnly ? { read: false } : {}),
    }

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          sender: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      db.notification.count({ where }),
      db.notification.count({
        where: { recipientId: userId, read: false },
      }),
    ])

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const userId = authResult.payload.sub
    const body = await request.json()
    const { notificationId, markAllRead } = body

    if (markAllRead) {
      const result = await db.notification.updateMany({
        where: { recipientId: userId, read: false },
        data: { read: true },
      })

      return NextResponse.json({
        message: `${result.count} notification(s) marked as read`,
        count: result.count,
      })
    }

    if (notificationId) {
      const notification = await db.notification.findUnique({
        where: { id: notificationId },
      })

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        )
      }

      if (notification.recipientId !== userId) {
        return NextResponse.json(
          { error: 'You do not have permission to update this notification' },
          { status: 403 }
        )
      }

      const updated = await db.notification.update({
        where: { id: notificationId },
        data: { read: true },
        include: {
          sender: {
            select: { id: true, name: true, avatar: true },
          },
        },
      })

      return NextResponse.json({ notification: updated })
    }

    return NextResponse.json(
      { error: 'Either notificationId or markAllRead must be provided' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}
