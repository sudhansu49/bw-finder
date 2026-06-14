import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth/jwt'

// GET: Fetch reminders for a lead
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
    }

    const reminders = await db.reminder.findMany({
      where: { leadId },
      orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }],
      include: {
        user: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ reminders })
  } catch (error) {
    console.error('Reminders fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
  }
}

// POST: Add a reminder to a lead
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await request.json()
    const { leadId, title, description, dueDate } = body
    const userId = authResult.payload.sub

    if (!leadId || !title?.trim() || !dueDate) {
      return NextResponse.json({ error: 'leadId, title, and dueDate are required' }, { status: 400 })
    }

    const reminder = await db.reminder.create({
      data: {
        leadId,
        userId,
        title: title.trim(),
        description: description?.trim() || null,
        dueDate: new Date(dueDate),
      },
      include: { user: { select: { id: true, name: true } } },
    })

    await db.activityLog.create({
      data: {
        leadId,
        userId,
        action: 'reminder_added',
        details: JSON.stringify({ reminderId: reminder.id, title: title.trim(), dueDate }),
      },
    })

    return NextResponse.json({ reminder }, { status: 201 })
  } catch (error) {
    console.error('Reminder creation error:', error)
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 })
  }
}

// PATCH: Update a reminder (toggle complete)
export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await request.json()
    const { reminderId, completed } = body

    if (!reminderId) {
      return NextResponse.json({ error: 'reminderId is required' }, { status: 400 })
    }

    const reminder = await db.reminder.update({
      where: { id: reminderId },
      data: { completed: completed ?? true },
    })

    return NextResponse.json({ reminder })
  } catch (error) {
    console.error('Reminder update error:', error)
    return NextResponse.json({ error: 'Failed to update reminder' }, { status: 500 })
  }
}

// DELETE: Remove a reminder
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const reminderId = searchParams.get('reminderId')

    if (!reminderId) {
      return NextResponse.json({ error: 'reminderId is required' }, { status: 400 })
    }

    await db.reminder.delete({ where: { id: reminderId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reminder deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 })
  }
}
