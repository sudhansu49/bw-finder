import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, signAccessToken, signRefreshToken, createSession, revokeSession } from '@/lib/auth/jwt'
import { db } from '@/lib/db'
import { applyRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { getRequestInfo } from '@/lib/security/audit'

export async function POST(request: NextRequest) {
  // Rate limiting
  const rl = applyRateLimit(request, RATE_LIMITS.auth)
  if (rl) return rateLimitResponse(rl)

  try {
    const refreshToken = request.cookies.get('bw-refresh-token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      )
    }

    // Verify the refresh token
    const payload = await verifyToken(refreshToken)
    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    // Find the session
    const session = await db.session.findUnique({
      where: { refreshToken },
    })

    if (!session || session.isRevoked || new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: 'Session expired or revoked' },
        { status: 401 }
      )
    }

    // Get fresh user data
    const user = await db.user.findUnique({
      where: { id: payload.sub },
      include: { plan: { select: { name: true, tier: true } } },
    })

    if (!user || user.status === 'suspended' || user.status === 'banned') {
      await revokeSession(session.id)
      return NextResponse.json(
        { error: 'Account is suspended' },
        { status: 403 }
      )
    }

    // Token rotation: revoke old session, create new one
    await revokeSession(session.id)

    const { ip, userAgent } = getRequestInfo(request)
    const newRefreshToken = await signRefreshToken(user.id, session.id)
    const newSessionId = await createSession(user.id, newRefreshToken, ip, userAgent)

    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      planId: user.planId,
      planTier: user.plan?.tier || 'free',
      sessionId: newSessionId,
    })

    return NextResponse.json({
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        planName: user.plan?.name || 'Free',
        planTier: user.plan?.tier || 'free',
      },
    }, {
      headers: {
        'Set-Cookie': [
          `bw-access-token=${accessToken}; HttpOnly; Path=/; Max-Age=900; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
          `bw-refresh-token=${newRefreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
        ].join(', '),
      },
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    )
  }
}
