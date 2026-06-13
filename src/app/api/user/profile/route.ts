import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const userId = authResult.payload.sub

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        role: true,
        avatar: true,
        credits: true,
        planId: true,
        status: true,
        agencyId: true,
        lastLoginAt: true,
        loginIp: true,
        createdAt: true,
        updatedAt: true,
        plan: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            credits: true,
            features: true,
            maxLeads: true,
            maxSearches: true,
            maxExports: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await request.json()
    const { name, email, company, avatar } = body
    const userId = authResult.payload.sub

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If email is being changed, check for uniqueness
    if (email && email !== user.email) {
      const existingUser = await db.user.findUnique({ where: { email } })
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 409 }
        )
      }
    }

    const updateData: Prisma.UserUpdateInput = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (company !== undefined) updateData.company = company
    if (avatar !== undefined) updateData.avatar = avatar

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        role: true,
        avatar: true,
        credits: true,
        planId: true,
        status: true,
        agencyId: true,
        lastLoginAt: true,
        loginIp: true,
        createdAt: true,
        updatedAt: true,
        plan: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            credits: true,
            features: true,
            maxLeads: true,
            maxSearches: true,
            maxExports: true,
          },
        },
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Update user profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}
