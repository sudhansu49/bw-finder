import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth/jwt'

// Default notification preference items
const DEFAULT_PREFERENCES = [
  { category: 'lead-alerts', itemKey: 'new-leads', enabled: true },
  { category: 'lead-alerts', itemKey: 'lead-score', enabled: true },
  { category: 'outreach-updates', itemKey: 'email-opened', enabled: true },
  { category: 'outreach-updates', itemKey: 'call-reminders', enabled: true },
  { category: 'system', itemKey: 'plan-updates', enabled: true },
  { category: 'system', itemKey: 'maintenance', enabled: false },
  { category: 'marketing', itemKey: 'tips', enabled: true },
  { category: 'marketing', itemKey: 'offers', enabled: false },
]

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const userId = authResult.payload.sub

    // Get existing preferences
    let preferences = await db.notificationPreference.findMany({
      where: { userId },
    })

    // If no preferences exist yet, seed defaults
    if (preferences.length === 0) {
      await db.notificationPreference.createMany({
        data: DEFAULT_PREFERENCES.map((p) => ({
          userId,
          category: p.category,
          itemKey: p.itemKey,
          enabled: p.enabled,
        })),
      })
      preferences = await db.notificationPreference.findMany({
        where: { userId },
      })
    }

    // Group by category
    const grouped = preferences.reduce((acc, p) => {
      if (!acc[p.category]) {
        acc[p.category] = []
      }
      acc[p.category].push({
        id: p.id,
        itemKey: p.itemKey,
        enabled: p.enabled,
      })
      return acc
    }, {} as Record<string, { id: string; itemKey: string; enabled: boolean }[]>)

    return NextResponse.json({ preferences: grouped })
  } catch (error) {
    console.error('Get notification preferences error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
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
    const { category, itemKey, enabled } = body

    if (!category || !itemKey || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'category, itemKey, and enabled (boolean) are required' },
        { status: 400 }
      )
    }

    // Upsert the preference
    const preference = await db.notificationPreference.upsert({
      where: {
        userId_category_itemKey: { userId, category, itemKey },
      },
      create: {
        userId,
        category,
        itemKey,
        enabled,
      },
      update: {
        enabled,
      },
    })

    return NextResponse.json({ preference })
  } catch (error) {
    console.error('Update notification preference error:', error)
    return NextResponse.json(
      { error: 'Failed to update notification preference' },
      { status: 500 }
    )
  }
}
