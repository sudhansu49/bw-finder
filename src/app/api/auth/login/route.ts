import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/auth-utils'
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth/jwt'
import { applyRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { auditLogin, auditLoginFailure, getRequestInfo } from '@/lib/security/audit'

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = applyRateLimit(request, RATE_LIMITS.login)
  if (rateLimitResult) {
    return rateLimitResponse(rateLimitResult)
  }

  try {
    const body = await request.json()
    const { email, password } = body
    const { ip, userAgent } = getRequestInfo(request)

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
      await auditLoginFailure(email, ip, userAgent)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user is suspended/banned
    if (user.status === 'suspended' || user.status === 'banned') {
      await auditLoginFailure(email, ip, userAgent)
      return NextResponse.json(
        { error: 'Account is suspended. Please contact support.' },
        { status: 403 }
      )
    }

    // Verify the password
    const isValid = verifyPassword(password, user.password)

    if (!isValid) {
      await auditLoginFailure(email, ip, userAgent)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT tokens
    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      planId: user.planId,
      planTier: user.plan?.tier || 'free',
    })
    const refreshToken = await signRefreshToken(user.id)

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginIp: ip || null,
      },
    })

    // Audit log
    await auditLogin(user.id, ip, userAgent)

    // Return user without password, include plan name and tier
    const { password: _, plan, ...userWithoutPassword } = user
    const response = NextResponse.json({
      user: {
        ...userWithoutPassword,
        planName: plan?.name || 'Free',
        planTier: plan?.tier || 'free',
      },
      token: accessToken, // Also send in body for client-side storage fallback
    })

    // Set auth cookies
    return setAuthCookies(response, accessToken, refreshToken)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}
