import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where: Prisma.SubscriptionWhereInput = {}

    if (status) {
      where.status = status
    }

    const [subscriptions, total] = await Promise.all([
      db.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
              price: true,
              credits: true,
            },
          },
        },
      }),
      db.subscription.count({ where }),
    ])

    return NextResponse.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin get subscriptions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscriptionId, status, cancelAtPeriodEnd, planId } = body

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'subscriptionId is required' },
        { status: 400 }
      )
    }

    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // If changing plan, verify the new plan exists
    if (planId) {
      const plan = await db.plan.findUnique({ where: { id: planId } })
      if (!plan) {
        return NextResponse.json(
          { error: 'Plan not found' },
          { status: 404 }
        )
      }
    }

    const updateData: Prisma.SubscriptionUpdateInput = {}
    if (status !== undefined) updateData.status = status
    if (cancelAtPeriodEnd !== undefined) updateData.cancelAtPeriodEnd = cancelAtPeriodEnd
    if (planId !== undefined) {
      updateData.plan = { connect: { id: planId } }
    }

    const updatedSubscription = await db.subscription.update({
      where: { id: subscriptionId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            credits: true,
          },
        },
      },
    })

    // If the subscription's plan changed, also update the user's planId
    if (planId) {
      await db.user.update({
        where: { id: subscription.userId },
        data: { planId },
      })
    }

    return NextResponse.json({ subscription: updatedSubscription })
  } catch (error) {
    console.error('Admin update subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}
