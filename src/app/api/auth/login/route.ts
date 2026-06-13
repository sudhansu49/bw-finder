import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find the user with plan info
    const user = await db.user.findUnique({
      where: { email },
      include: { plan: { select: { name: true, tier: true } } },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify the password
    const isValid = verifyPassword(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Return user without password, include plan name and tier
    const { password: _, plan, ...userWithoutPassword } = user
    return NextResponse.json({ 
      user: { 
        ...userWithoutPassword, 
        planName: plan?.name || 'Free',
        planTier: plan?.tier || 'free'
      } 
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}
