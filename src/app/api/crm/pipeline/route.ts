import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth/jwt'

// Pipeline stage definitions
export const PIPELINE_STAGES = [
  { id: 'new_lead', label: 'New Lead', color: '#6366f1' },
  { id: 'contacted', label: 'Contacted', color: '#f59e0b' },
  { id: 'interested', label: 'Interested', color: '#3b82f6' },
  { id: 'meeting_scheduled', label: 'Meeting Scheduled', color: '#8b5cf6' },
  { id: 'proposal_sent', label: 'Proposal Sent', color: '#ec4899' },
  { id: 'won', label: 'Won', color: '#10b981' },
  { id: 'lost', label: 'Lost', color: '#ef4444' },
] as const

// GET: Fetch all leads grouped by pipeline stage
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const where: Record<string, unknown> = { userId: authResult.payload.sub }

    const leads = await db.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            category: true,
            city: true,
            state: true,
            country: true,
            phone: true,
            email: true,
            website: true,
            hasWebsite: true,
            leadScore: true,
            opportunityScore: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { leadNotes: true, leadTasks: true, reminders: true, activities: true },
        },
      },
    })

    // Fetch pending tasks and reminders separately
    const leadIds = leads.map(l => l.id)
    const [pendingTasks, pendingReminders] = await Promise.all([
      db.leadTask.findMany({
        where: { leadId: { in: leadIds }, completed: false },
        select: { id: true, leadId: true, title: true, dueDate: true },
        orderBy: { dueDate: 'asc' },
      }),
      db.reminder.findMany({
        where: { leadId: { in: leadIds }, completed: false },
        select: { id: true, leadId: true, title: true, dueDate: true },
        orderBy: { dueDate: 'asc' },
      }),
    ])

    // Attach tasks and reminders to leads
    const taskMap = new Map<string, typeof pendingTasks>()
    for (const t of pendingTasks) {
      if (!taskMap.has(t.leadId)) taskMap.set(t.leadId, [])
      taskMap.get(t.leadId)!.push(t)
    }
    const reminderMap = new Map<string, typeof pendingReminders>()
    for (const r of pendingReminders) {
      if (!reminderMap.has(r.leadId)) reminderMap.set(r.leadId, [])
      reminderMap.get(r.leadId)!.push(r)
    }

    const leadsWithExtras = leads.map(l => ({
      ...l,
      leadTasks: (taskMap.get(l.id) || []).slice(0, 3),
      reminders: (reminderMap.get(l.id) || []).slice(0, 3),
    }))

    // Group by pipeline stage
    const pipeline: Record<string, typeof leadsWithExtras> = {}
    for (const stage of PIPELINE_STAGES) {
      pipeline[stage.id] = []
    }

    for (const lead of leadsWithExtras) {
      const stage = lead.status || 'new_lead'
      if (pipeline[stage]) {
        pipeline[stage].push(lead)
      } else {
        pipeline['new_lead'].push(lead)
      }
    }

    // Calculate stats
    const stats = {
      totalLeads: leadsWithExtras.length,
      totalValue: leadsWithExtras.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
      wonValue: leadsWithExtras.filter(l => l.status === 'won').reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
      conversionRate: leadsWithExtras.length > 0
        ? Math.round((leadsWithExtras.filter(l => l.status === 'won').length / leadsWithExtras.length) * 100)
        : 0,
    }

    return NextResponse.json({ pipeline, stages: PIPELINE_STAGES, stats })
  } catch (error) {
    console.error('Pipeline fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch pipeline' }, { status: 500 })
  }
}

// PATCH: Update lead stage (move between pipeline columns)
export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await request.json()
    const { leadId, status, priority, estimatedValue } = body

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
    }

    const lead = await db.lead.findUnique({ where: { id: leadId } })
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Ownership check
    const isAdmin = ['super_admin', 'admin'].includes(authResult.payload.role)
    if (!isAdmin && lead.userId !== authResult.payload.sub) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (estimatedValue !== undefined) updateData.estimatedValue = estimatedValue

    const updated = await db.lead.update({
      where: { id: leadId },
      data: updateData,
      include: {
        business: { select: { name: true, category: true, city: true } },
      },
    })

    // Log activity if status changed
    if (status && status !== lead.status) {
      const oldStage = PIPELINE_STAGES.find(s => s.id === lead.status)
      const newStage = PIPELINE_STAGES.find(s => s.id === status)
      await db.activityLog.create({
        data: {
          leadId,
          userId: authResult.payload.sub,
          action: 'status_change',
          details: JSON.stringify({
            from: oldStage?.label || lead.status,
            to: newStage?.label || status,
          }),
        },
      })
    }

    return NextResponse.json({ lead: updated })
  } catch (error) {
    console.error('Pipeline update error:', error)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}
