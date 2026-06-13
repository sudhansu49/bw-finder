import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/jwt'
import { applyRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { hasPermission, ROLE_PERMISSIONS, ROLE_HIERARCHY, type Permission, type Role } from '@/lib/rbac'
import { auditRoleChange, getRequestInfo } from '@/lib/security/audit'

// GET: List roles and permissions
export async function GET(request: NextRequest) {
  const rl = applyRateLimit(request, RATE_LIMITS.admin)
  if (rl) return rateLimitResponse(rl)

  const authResult = await requireAdmin(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  if (!hasPermission(authResult.payload.role, 'users.list' as Permission)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    // Get user counts by role
    const usersByRole = await db.user.groupBy({
      by: ['role'],
      _count: { role: true },
    })

    const roleCounts = Object.fromEntries(
      usersByRole.map((e) => [e.role, e._count.role])
    )

    // Build role matrix
    const roles = Object.entries(ROLE_HIERARCHY).map(([role, level]) => ({
      role,
      level,
      userCount: roleCounts[role] || 0,
      permissions: ROLE_PERMISSIONS[role as Role] || [],
      permissionCount: (ROLE_PERMISSIONS[role as Role] || []).length,
    }))

    // All unique permissions grouped by category
    const allPermissions = Object.values(ROLE_PERMISSIONS).flat()
    const uniquePermissions = [...new Set(allPermissions)]

    const permissionCategories: Record<string, string[]> = {}
    uniquePermissions.forEach((p) => {
      const category = p.split('.')[0]
      if (!permissionCategories[category]) permissionCategories[category] = []
      permissionCategories[category].push(p)
    })

    return NextResponse.json({
      roles,
      permissionCategories,
      totalPermissions: uniquePermissions.length,
    })
  } catch (error) {
    console.error('Get roles error:', error)
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

// PATCH: Change user role
export async function PATCH(request: NextRequest) {
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
    const { userId, role } = body
    const { ip } = getRequestInfo(request)

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role are required' }, { status: 400 })
    }

    // Validate role
    const validRoles = ['super_admin', 'admin', 'agency_owner', 'team_member', 'user']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Cannot change role of super_admin unless you are super_admin
    const targetUser = await db.user.findUnique({ where: { id: userId } })
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (targetUser.role === 'super_admin' && authResult.payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Cannot modify super admin role' }, { status: 403 })
    }

    // Cannot assign super_admin role unless you are super_admin
    if (role === 'super_admin' && authResult.payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Only super admin can assign super admin role' }, { status: 403 })
    }

    const oldRole = targetUser.role
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true, email: true, name: true, role: true, status: true,
        createdAt: true, updatedAt: true,
      },
    })

    await auditRoleChange(authResult.payload.sub, userId, oldRole, role, ip)

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Update role error:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}
