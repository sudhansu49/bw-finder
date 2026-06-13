import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { requireAdmin } from '@/lib/auth/jwt'
import { applyRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { auditAdminUserAction, auditUnauthorizedAccess, getRequestInfo } from '@/lib/security/audit'
import { hasPermission, type Permission } from '@/lib/rbac'

export async function GET(request: NextRequest) {
  // Rate limiting
  const rl = applyRateLimit(request, RATE_LIMITS.admin)
  if (rl) return rateLimitResponse(rl)

  // Auth check - require admin
  const authResult = await requireAdmin(request)
  if (!authResult.success) {
    if (authResult.payload) {
      const { ip, userAgent } = getRequestInfo(request)
      await auditUnauthorizedAccess(authResult.payload, 'ADMIN_USERS_LIST', ip, userAgent)
    }
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  // RBAC check
  if (!hasPermission(authResult.payload.role, 'users.list' as Permission)) {
    const { ip, userAgent } = getRequestInfo(request)
    await auditUnauthorizedAccess(authResult.payload, 'ADMIN_USERS_LIST', ip, userAgent)
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where: Prisma.UserWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    if (role) where.role = role
    if (status) where.status = status

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          company: true,
          role: true,
          avatar: true,
          credits: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          plan: { select: { id: true, name: true, price: true } },
          subscriptions: {
            where: { status: 'active' },
            select: { id: true, status: true, currentPeriodEnd: true, plan: { select: { name: true } } },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          _count: { select: { leads: true } },
        },
      }),
      db.user.count({ where }),
    ])

    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
      role: user.role,
      avatar: user.avatar,
      credits: user.credits,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      plan: user.plan,
      activeSubscription: user.subscriptions[0] || null,
      leadCount: user._count.leads,
    }))

    return NextResponse.json({
      users: formattedUsers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Admin get users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

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
    const { userId, role, status, credits } = body
    const { ip } = getRequestInfo(request)

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updateData: Prisma.UserUpdateInput = {}
    if (role !== undefined) updateData.role = role
    if (status !== undefined) updateData.status = status
    if (credits !== undefined) updateData.credits = credits

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true, email: true, name: true, company: true, role: true,
        credits: true, status: true, lastLoginAt: true, createdAt: true, updatedAt: true,
        plan: { select: { id: true, name: true, price: true } },
      },
    })

    // Audit log
    const changes: string[] = []
    if (role !== undefined && role !== user.role) changes.push(`role: ${user.role} → ${role}`)
    if (status !== undefined && status !== user.status) changes.push(`status: ${user.status} → ${status}`)
    if (credits !== undefined && credits !== user.credits) changes.push(`credits: ${user.credits} → ${credits}`)
    await auditAdminUserAction(authResult.payload.sub, 'USER_UPDATED', userId, changes.join(', ') || 'No changes', ip)

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Admin update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const rl = applyRateLimit(request, RATE_LIMITS.admin)
  if (rl) return rateLimitResponse(rl)

  const authResult = await requireAdmin(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  if (!hasPermission(authResult.payload.role, 'users.delete' as Permission)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const { ip } = getRequestInfo(request)

    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Soft delete by setting status to 'banned'
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { status: 'banned' },
      select: { id: true, email: true, name: true, status: true },
    })

    await auditAdminUserAction(authResult.payload.sub, 'USER_BANNED', userId, `User "${user.name}" banned`, ip)

    return NextResponse.json({
      user: updatedUser,
      message: 'User has been banned (soft deleted)',
    })
  } catch (error) {
    console.error('Admin delete user error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
