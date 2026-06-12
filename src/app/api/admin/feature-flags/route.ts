import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const enabled = searchParams.get('enabled')

    const where: Prisma.FeatureFlagWhereInput = {}

    if (enabled !== null && enabled !== undefined && enabled !== '') {
      where.enabled = enabled === 'true'
    }

    const featureFlags = await db.featureFlag.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: featureFlags })
  } catch (error) {
    console.error('Admin get feature flags error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, name, description, enabled, rolloutPct, targetRoles } = body

    if (!key || !name) {
      return NextResponse.json(
        { error: 'key and name are required' },
        { status: 400 }
      )
    }

    // Check if key already exists
    const existing = await db.featureFlag.findUnique({ where: { key } })
    if (existing) {
      return NextResponse.json(
        { error: 'Feature flag key already exists' },
        { status: 409 }
      )
    }

    // Validate rolloutPct range
    const rollout = rolloutPct !== undefined ? rolloutPct : 0
    if (rollout < 0 || rollout > 100) {
      return NextResponse.json(
        { error: 'rolloutPct must be between 0 and 100' },
        { status: 400 }
      )
    }

    const featureFlag = await db.featureFlag.create({
      data: {
        key,
        name,
        description: description || null,
        enabled: enabled !== undefined ? enabled : false,
        rolloutPct: rollout,
        targetRoles: targetRoles || null,
      },
    })

    return NextResponse.json(
      { data: featureFlag },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin create feature flag error:', error)
    return NextResponse.json(
      { error: 'Failed to create feature flag' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { flagId, name, description, enabled, rolloutPct, targetRoles } = body

    if (!flagId) {
      return NextResponse.json(
        { error: 'flagId is required' },
        { status: 400 }
      )
    }

    const flag = await db.featureFlag.findUnique({ where: { id: flagId } })
    if (!flag) {
      return NextResponse.json(
        { error: 'Feature flag not found' },
        { status: 404 }
      )
    }

    // Validate rolloutPct range if provided
    if (rolloutPct !== undefined && (rolloutPct < 0 || rolloutPct > 100)) {
      return NextResponse.json(
        { error: 'rolloutPct must be between 0 and 100' },
        { status: 400 }
      )
    }

    const updateData: Prisma.FeatureFlagUpdateInput = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (enabled !== undefined) updateData.enabled = enabled
    if (rolloutPct !== undefined) updateData.rolloutPct = rolloutPct
    if (targetRoles !== undefined) updateData.targetRoles = targetRoles

    const updatedFlag = await db.featureFlag.update({
      where: { id: flagId },
      data: updateData,
    })

    return NextResponse.json({ data: updatedFlag })
  } catch (error) {
    console.error('Admin update feature flag error:', error)
    return NextResponse.json(
      { error: 'Failed to update feature flag' },
      { status: 500 }
    )
  }
}
