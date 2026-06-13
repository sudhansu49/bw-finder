import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/jwt'
import { applyRateLimit, rateLimitResponse, RATE_LIMITS, getRateLimitStats } from '@/lib/security/rate-limit'
import { hasPermission, type Permission } from '@/lib/rbac'
import { Prisma } from '@prisma/client'

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
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Parallel queries for performance
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      bannedUsers,
      totalSessions,
      activeSessions,
      recentLogins,
      failedLoginsToday,
      securityEventsToday,
      securityEventsWeek,
      criticalEventsToday,
      authLogsToday,
      auditLogsToday,
      adminActionsToday,
      rateLimitHits,
      sessionsByDay,
      securityEventsByCategory,
      topActionsToday,
      usersByRole,
      recentSecurityEvents,
    ] = await Promise.all([
      // User stats
      db.user.count(),
      db.user.count({ where: { status: 'active' } }),
      db.user.count({ where: { status: 'suspended' } }),
      db.user.count({ where: { status: 'banned' } }),

      // Session stats
      db.session.count(),
      db.session.count({ where: { isRevoked: false, expiresAt: { gt: now } } }),

      // Login stats
      db.systemAuditLog.count({ where: { action: 'LOGIN_SUCCESS', createdAt: { gte: todayStart } } }),
      db.systemAuditLog.count({ where: { action: 'LOGIN_FAILED', createdAt: { gte: todayStart } } }),
      db.systemAuditLog.count({ where: { category: 'security', createdAt: { gte: todayStart } } }),
      db.systemAuditLog.count({ where: { category: 'security', createdAt: { gte: weekAgo } } }),
      db.systemAuditLog.count({ where: { severity: 'critical', createdAt: { gte: todayStart } } }),
      db.systemAuditLog.count({ where: { category: 'auth', createdAt: { gte: todayStart } } }),
      db.systemAuditLog.count({ where: { createdAt: { gte: todayStart } } }),
      db.systemAuditLog.count({ where: { category: 'admin', createdAt: { gte: todayStart } } }),
      db.systemAuditLog.count({ where: { action: 'RATE_LIMIT_EXCEEDED', createdAt: { gte: weekAgo } } }),

      // Sessions by day (last 7 days)
      db.systemAuditLog.findMany({
        where: { action: 'LOGIN_SUCCESS', createdAt: { gte: weekAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),

      // Security events by category
      db.systemAuditLog.groupBy({
        by: ['action'],
        where: { category: 'security', createdAt: { gte: weekAgo } },
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),

      // Top actions today
      db.systemAuditLog.groupBy({
        by: ['action'],
        where: { createdAt: { gte: todayStart } },
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 5,
      }),

      // Users by role
      db.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),

      // Recent security events
      db.systemAuditLog.findMany({
        where: { category: { in: ['security', 'auth'] }, severity: { in: ['warning', 'error', 'critical'] } },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
    ])

    // Process sessions by day
    const sessionByDayMap = new Map<string, number>()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().split('T')[0]
      sessionByDayMap.set(key, 0)
    }
    sessionsByDay.forEach((log) => {
      const key = log.createdAt.toISOString().split('T')[0]
      if (sessionByDayMap.has(key)) {
        sessionByDayMap.set(key, (sessionByDayMap.get(key) || 0) + 1)
      }
    })
    const loginChart = Array.from(sessionByDayMap.entries()).map(([date, count]) => ({ date, count }))

    // Get rate limit stats
    const rlStats = getRateLimitStats()

    return NextResponse.json({
      users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers, banned: bannedUsers },
      sessions: { total: totalSessions, active: activeSessions },
      today: {
        logins: recentLogins,
        failedLogins: failedLoginsToday,
        securityEvents: securityEventsToday,
        criticalEvents: criticalEventsToday,
        authLogs: authLogsToday,
        auditLogs: auditLogsToday,
        adminActions: adminActionsToday,
      },
      weekly: {
        securityEvents: securityEventsWeek,
        rateLimitHits,
      },
      rateLimits: rlStats,
      charts: {
        loginsByDay: loginChart,
        securityByCategory: securityEventsByCategory.map((e) => ({ action: e.action, count: e._count.action })),
        topActions: topActionsToday.map((e) => ({ action: e.action, count: e._count.action })),
      },
      usersByRole: usersByRole.map((e) => ({ role: e.role, count: e._count.role })),
      recentSecurityEvents,
    })
  } catch (error) {
    console.error('Security dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch security data' }, { status: 500 })
  }
}
