import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Fetch activity timeline for a lead
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
    }

    const activities = await db.activityLog.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Activities fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}
