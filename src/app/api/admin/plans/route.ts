import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const plans = await db.plan.findMany({
      orderBy: { price: 'asc' },
      include: {
        _count: {
          select: { users: true, subscriptions: true },
        },
      },
    })

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Admin get plans error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      price,
      credits,
      features,
      popular,
      maxLeads,
      maxSearches,
      maxExports,
    } = body

    if (!name || !description || price === undefined || credits === undefined) {
      return NextResponse.json(
        { error: 'name, description, price, and credits are required' },
        { status: 400 }
      )
    }

    // Check if plan name already exists
    const existingPlan = await db.plan.findUnique({ where: { name } })
    if (existingPlan) {
      return NextResponse.json(
        { error: 'A plan with this name already exists' },
        { status: 409 }
      )
    }

    // Parse features if it's a JSON string
    let featuresValue = features
    if (typeof features === 'object') {
      featuresValue = JSON.stringify(features)
    }

    const plan = await db.plan.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        credits: parseInt(credits, 10),
        features: featuresValue || '[]',
        popular: popular || false,
        maxLeads: maxLeads ? parseInt(maxLeads, 10) : 100,
        maxSearches: maxSearches ? parseInt(maxSearches, 10) : 50,
        maxExports: maxExports ? parseInt(maxExports, 10) : 20,
      },
    })

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error('Admin create plan error:', error)
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, name, description, price, credits, features, popular, maxLeads, maxSearches, maxExports } = body

    if (!planId) {
      return NextResponse.json(
        { error: 'planId is required' },
        { status: 400 }
      )
    }

    const plan = await db.plan.findUnique({ where: { id: planId } })
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // If changing name, check for uniqueness
    if (name && name !== plan.name) {
      const existingPlan = await db.plan.findUnique({ where: { name } })
      if (existingPlan) {
        return NextResponse.json(
          { error: 'A plan with this name already exists' },
          { status: 409 }
        )
      }
    }

    const updateData: Prisma.PlanUpdateInput = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = parseFloat(price)
    if (credits !== undefined) updateData.credits = parseInt(credits, 10)
    if (features !== undefined) {
      updateData.features = typeof features === 'object' ? JSON.stringify(features) : features
    }
    if (popular !== undefined) updateData.popular = popular
    if (maxLeads !== undefined) updateData.maxLeads = parseInt(maxLeads, 10)
    if (maxSearches !== undefined) updateData.maxSearches = parseInt(maxSearches, 10)
    if (maxExports !== undefined) updateData.maxExports = parseInt(maxExports, 10)

    const updatedPlan = await db.plan.update({
      where: { id: planId },
      data: updateData,
    })

    return NextResponse.json({ plan: updatedPlan })
  } catch (error) {
    console.error('Admin update plan error:', error)
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId')

    if (!planId) {
      return NextResponse.json(
        { error: 'planId query parameter is required' },
        { status: 400 }
      )
    }

    const plan = await db.plan.findUnique({
      where: { id: planId },
      include: {
        _count: { select: { users: true, subscriptions: true } },
      },
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Check if there are active users or subscriptions on this plan
    if (plan._count.users > 0 || plan._count.subscriptions > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete plan with active users or subscriptions',
          activeUsers: plan._count.users,
          activeSubscriptions: plan._count.subscriptions,
        },
        { status: 409 }
      )
    }

    await db.plan.delete({ where: { id: planId } })

    return NextResponse.json({
      message: 'Plan deleted successfully',
      planId,
    })
  } catch (error) {
    console.error('Admin delete plan error:', error)
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    )
  }
}
