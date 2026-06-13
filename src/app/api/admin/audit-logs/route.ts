import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { requireAdmin } from '@/lib/auth/jwt'
import { applyRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { hasPermission, type Permission } from '@/lib/rbac'

export async function GET(request: NextRequest) {
  // Rate limiting
  const rl = applyRateLimit(request, RATE_LIMITS.admin)
  if (rl) return rateLimitResponse(rl)

  // Auth check - require admin
  const authResult = await requireAdmin(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  // RBAC check
  if (!hasPermission(authResult.payload.role, 'audit.view' as Permission)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const severity = searchParams.get('severity')
    const actorId = searchParams.get('actorId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const skip = (page - 1) * limit

    const where: Prisma.SystemAuditLogWhereInput = {}

    if (category) where.category = category
    if (severity) where.severity = severity
    if (actorId) where.actorId = actorId

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate) }
      if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) }
    }

    const [logs, total] = await Promise.all([
      db.systemAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              avatar: true,
            },
          },
        },
      }),
      db.systemAuditLog.count({ where }),
    ])

    // Compute summary stats
    const [
      totalLogs,
      authLogs,
      securityLogs,
      criticalLogs,
      todayLogs,
    ] = await Promise.all([
      db.systemAuditLog.count(),
      db.systemAuditLog.count({ where: { category: 'auth' } }),
      db.systemAuditLog.count({ where: { category: 'security' } }),
      db.systemAuditLog.count({ where: { severity: 'critical' } }),
      db.systemAuditLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ])

    return NextResponse.json({
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: {
        totalLogs,
        authLogs,
        securityLogs,
        criticalLogs,
        todayLogs,
      },
    })
  } catch (error) {
    console.error('Admin get audit logs error:', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
