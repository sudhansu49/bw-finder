import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/jwt'
import { revokeSession, revokeAllUserSessions } from '@/lib/auth/jwt'
import { applyRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { hasPermission, type Permission } from '@/lib/rbac'
import { auditSessionEvent, getRequestInfo } from '@/lib/security/audit'

// GET: List active sessions
export async function GET(request: NextRequest) {
  const rl = applyRateLimit(request, RATE_LIMITS.admin)
  if (rl) return rateLimitResponse(rl)

  const authResult = await requireAdmin(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  if (!hasPermission(authResult.payload.role, 'audit.view' as Permission)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const userId = searchParams.get('userId')
    const active = searchParams.get('active')
    const skip = (page - 1) * limit

    const where: any = {}
    if (userId) where.userId = userId
    if (active === 'true') {
      where.isRevoked = false
      where.expiresAt = { gt: new Date() }
    }

    const [sessions, total] = await Promise.all([
      db.session.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastActiveAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, avatar: true },
          },
        },
      }),
      db.session.count({ where }),
    ])

    // Stats
    const [totalSessions, activeSessions, revokedSessions] = await Promise.all([
      db.session.count(),
      db.session.count({ where: { isRevoked: false, expiresAt: { gt: new Date() } } }),
      db.session.count({ where: { isRevoked: true } }),
    ])

    return NextResponse.json({
      sessions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: { total: totalSessions, active: activeSessions, revoked: revokedSessions },
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

// DELETE: Revoke session(s)
export async function DELETE(request: NextRequest) {
  const rl = applyRateLimit(request, RATE_LIMITS.admin)
  if (rl) return rateLimitResponse(rl)

  const authResult = await requireAdmin(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  if (!hasPermission(authResult.payload.role, 'users.update' as Permission)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { sessionId, userId, revokeAll } = body
    const { ip } = getRequestInfo(request)

    if (revokeAll && userId) {
      const count = await revokeAllUserSessions(userId)
      await auditSessionEvent(userId, 'ALL_SESSIONS_REVOKED', `${count} sessions revoked by admin`, ip, 'warning')
      return NextResponse.json({ message: `Revoked ${count} sessions`, count })
    }

    if (sessionId) {
      const session = await db.session.findUnique({
        where: { id: sessionId },
        include: { user: { select: { id: true, name: true } } },
      })
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }
      await revokeSession(sessionId)
      await auditSessionEvent(session.userId, 'SESSION_REVOKED', `Session revoked by admin for ${session.user.name}`, ip, 'warning')
      return NextResponse.json({ message: 'Session revoked' })
    }

    return NextResponse.json({ error: 'Provide sessionId or userId with revokeAll' }, { status: 400 })
  } catch (error) {
    console.error('Revoke session error:', error)
    return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 })
  }
}
