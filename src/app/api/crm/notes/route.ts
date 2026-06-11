import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Fetch notes for a lead
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
    }

    const notes = await db.leadNote.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Notes fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

// POST: Add a note to a lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, userId, content } = body

    if (!leadId || !userId || !content?.trim()) {
      return NextResponse.json({ error: 'leadId, userId, and content are required' }, { status: 400 })
    }

    const note = await db.leadNote.create({
      data: { leadId, userId, content: content.trim() },
      include: { user: { select: { id: true, name: true } } },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        leadId,
        userId,
        action: 'note_added',
        details: JSON.stringify({ noteId: note.id, preview: content.trim().slice(0, 100) }),
      },
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('Note creation error:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}

// DELETE: Remove a note
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('noteId')

    if (!noteId) {
      return NextResponse.json({ error: 'noteId is required' }, { status: 400 })
    }

    await db.leadNote.delete({ where: { id: noteId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Note deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
