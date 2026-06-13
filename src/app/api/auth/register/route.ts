import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHashedPassword } from '@/lib/auth-utils'
import { signAccessToken, signRefreshToken, setAuthCookies, createSession } from '@/lib/auth/jwt'
import { applyRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { auditRegister, getRequestInfo } from '@/lib/security/audit'

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = applyRateLimit(request, RATE_LIMITS.register)
  if (rateLimitResult) {
    return rateLimitResponse(rateLimitResult)
  }

  try {
    const body = await request.json()
    const { email, name, password, company } = body
    const { ip, userAgent } = getRequestInfo(request)

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      )
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = createHashedPassword(password)

    // Create the user with default Free plan credits
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        company: company || null,
        role: 'user',
        credits: 50,
      },
    })

    // Generate JWT tokens with session
    const refreshToken = await signRefreshToken(user.id, 'pending')
    const sessionId = await createSession(user.id, refreshToken, ip, userAgent)

    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      planId: null,
      planTier: 'free',
      sessionId,
    })

    // Audit log
    await auditRegister(user.id, ip, userAgent)

    // Create welcome notifications for new user
    try {
      await db.notification.createMany({
        data: [
          {
            recipientId: user.id,
            type: 'system',
            title: 'Welcome to BW Finder!',
            message: 'Start by searching for businesses without websites in your area. Use the Lead Finder to discover new opportunities.',
            read: true,
          },
          {
            recipientId: user.id,
            type: 'lead',
            title: 'Discover businesses without websites',
            message: 'Use the Lead Finder to search for businesses in your area that don\'t have a website yet — your next opportunity awaits!',
            read: false,
          },
          {
            recipientId: user.id,
            type: 'outreach',
            title: 'Try the Outreach tools',
            message: 'Once you find leads, use our Email and WhatsApp generators to craft personalized outreach messages.',
            read: false,
          },
        ],
      })
    } catch {
      // Silent fail - non-critical
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    const response = NextResponse.json({
      user: {
        ...userWithoutPassword,
        planName: 'Free',
        planTier: 'free',
      },
      token: accessToken,
    }, { status: 201 })

    // Set auth cookies
    return setAuthCookies(response, accessToken, refreshToken)
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
