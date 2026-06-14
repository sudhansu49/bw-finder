import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where: Prisma.AnnouncementWhereInput = {}

    if (active !== null && active !== undefined && active !== '') {
      where.active = active === 'true'
    }

    if (type) {
      where.type = type
    }

    const [announcements, total] = await Promise.all([
      db.announcement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.announcement.count({ where }),
    ])

    return NextResponse.json({
      data: announcements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin get announcements error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, type, priority, active, startsAt, expiresAt } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'title and content are required' },
        { status: 400 }
      )
    }

    if (!startsAt) {
      return NextResponse.json(
        { error: 'startsAt is required' },
        { status: 400 }
      )
    }

    // Validate dates
    const start = new Date(startsAt)
    if (isNaN(start.getTime())) {
      return NextResponse.json(
        { error: 'Invalid startsAt date' },
        { status: 400 }
      )
    }

    if (expiresAt) {
      const expire = new Date(expiresAt)
      if (isNaN(expire.getTime())) {
        return NextResponse.json(
          { error: 'Invalid expiresAt date' },
          { status: 400 }
        )
      }
      if (expire <= start) {
        return NextResponse.json(
          { error: 'expiresAt must be after startsAt' },
          { status: 400 }
        )
      }
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        type: type || 'info',
        priority: priority || 'normal',
        active: active !== undefined ? active : true,
        startsAt: start,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json(
      { data: announcement },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin create announcement error:', error)
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { announcementId, title, content, type, priority, active, expiresAt } = body

    if (!announcementId) {
      return NextResponse.json(
        { error: 'announcementId is required' },
        { status: 400 }
      )
    }

    const announcement = await db.announcement.findUnique({
      where: { id: announcementId },
    })
    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    // Validate expiresAt if provided
    if (expiresAt !== undefined) {
      const expire = new Date(expiresAt)
      if (isNaN(expire.getTime())) {
        return NextResponse.json(
          { error: 'Invalid expiresAt date' },
          { status: 400 }
        )
      }
      if (expire <= new Date(announcement.startsAt)) {
        return NextResponse.json(
          { error: 'expiresAt must be after startsAt' },
          { status: 400 }
        )
      }
    }

    const updateData: Prisma.AnnouncementUpdateInput = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (type !== undefined) updateData.type = type
    if (priority !== undefined) updateData.priority = priority
    if (active !== undefined) updateData.active = active
    if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt)

    const updatedAnnouncement = await db.announcement.update({
      where: { id: announcementId },
      data: updateData,
    })

    return NextResponse.json({ data: updatedAnnouncement })
  } catch (error) {
    console.error('Admin update announcement error:', error)
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    )
  }
}
