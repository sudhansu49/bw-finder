import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/auth-utils'
import { signAccessToken, signRefreshToken, setAuthCookies, createSession } from '@/lib/auth/jwt'
import { applyRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { auditLogin, auditLoginFailure, auditSecurityEvent, getRequestInfo } from '@/lib/security/audit'

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

    // Check if account is locked
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      await auditSecurityEvent('ACCOUNT_LOCKED', `Login attempt on locked account: ${email}`, 'warning', undefined, ip)
      return NextResponse.json(
        { error: 'Account is temporarily locked due to multiple failed attempts. Please try again later.' },
        { status: 423 }
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
      // Increment failed login attempts
      const newFailedAttempts = user.failedLoginAttempts + 1
      const updateData: any = { failedLoginAttempts: newFailedAttempts }

      // Lock account after 5 failed attempts for 30 minutes
      if (newFailedAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000)
        await auditSecurityEvent('ACCOUNT_LOCKED', `Account locked after ${newFailedAttempts} failed attempts: ${email}`, 'error', user.id, ip)
      }

      await db.user.update({
        where: { id: user.id },
        data: updateData,
      })

      await auditLoginFailure(email, ip, userAgent)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Reset failed login attempts on successful login
    await db.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginIp: ip || null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    })

    // Generate JWT tokens
    const refreshToken = await signRefreshToken(user.id, 'pending')
    const sessionId = await createSession(user.id, refreshToken, ip, userAgent)

    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      planId: user.planId,
      planTier: user.plan?.tier || 'free',
      sessionId,
    })

    // Audit log
    await auditLogin(user.id, ip, userAgent)

    // Return user without password
    const { password: _, plan, ...userWithoutPassword } = user
    const response = NextResponse.json({
      user: {
        ...userWithoutPassword,
        planName: plan?.name || 'Free',
        planTier: plan?.tier || 'free',
      },
      token: accessToken,
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
