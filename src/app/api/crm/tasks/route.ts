import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth/jwt'

// GET: Fetch tasks for a lead
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

    const tasks = await db.leadTask.findMany({
      where: { leadId },
      orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        user: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Tasks fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST: Add a task to a lead
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await request.json()
    const { leadId, title, description, dueDate } = body
    const userId = authResult.payload.sub

    if (!leadId || !title?.trim()) {
      return NextResponse.json({ error: 'leadId and title are required' }, { status: 400 })
    }

    const task = await db.leadTask.create({
      data: {
        leadId,
        userId,
        title: title.trim(),
        description: description?.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { user: { select: { id: true, name: true } } },
    })

    await db.activityLog.create({
      data: {
        leadId,
        userId,
        action: 'task_added',
        details: JSON.stringify({ taskId: task.id, title: title.trim() }),
      },
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Task creation error:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

// PATCH: Update a task (toggle complete, update fields)
export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await request.json()
    const { taskId, completed, title, description, dueDate } = body

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
    }

    const existing = await db.leadTask.findUnique({ where: { id: taskId } })
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (completed !== undefined) {
      updateData.completed = completed
      updateData.completedAt = completed ? new Date() : null
    }
    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null

    const task = await db.leadTask.update({
      where: { id: taskId },
      data: updateData,
    })

    if (completed && !existing.completed) {
      await db.activityLog.create({
        data: {
          leadId: existing.leadId,
          userId: authResult.payload.sub,
          action: 'task_completed',
          details: JSON.stringify({ taskId, title: existing.title }),
        },
      })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Task update error:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

// DELETE: Remove a task
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
    }

    await db.leadTask.delete({ where: { id: taskId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Task deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
