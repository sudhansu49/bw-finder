import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/jwt'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    // Get fresh user data from database
    const user = await db.user.findUnique({
      where: { id: authResult.payload.sub },
      include: { plan: { select: { name: true, tier: true } } },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.status === 'suspended' || user.status === 'banned') {
      return NextResponse.json(
        { error: 'Account is suspended' },
        { status: 403 }
      )
    }

    const { password: _, plan, ...userWithoutPassword } = user
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        planName: plan?.name || 'Free',
        planTier: plan?.tier || 'free',
      },
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 500 }
    )
  }
}
