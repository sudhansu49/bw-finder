import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const source = searchParams.get('source') || 'all' // 'credits', 'subscriptions', 'all'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    // Build credit transaction filters
    const creditWhere: Prisma.CreditTransactionWhereInput = {}

    if (type) {
      creditWhere.type = type
    }

    if (userId) {
      creditWhere.userId = userId
    }

    if (startDate || endDate) {
      creditWhere.createdAt = {}
      if (startDate) {
        creditWhere.createdAt = { ...creditWhere.createdAt, gte: new Date(startDate) }
      }
      if (endDate) {
        creditWhere.createdAt = { ...creditWhere.createdAt, lte: new Date(endDate) }
      }
    }

    // Build subscription filters
    const subWhere: Prisma.SubscriptionWhereInput = {}

    if (userId) {
      subWhere.userId = userId
    }

    if (startDate || endDate) {
      subWhere.createdAt = {}
      if (startDate) {
        subWhere.createdAt = { ...subWhere.createdAt, gte: new Date(startDate) }
      }
      if (endDate) {
        subWhere.createdAt = { ...subWhere.createdAt, lte: new Date(endDate) }
      }
    }

    let creditTransactions: Array<{
      id: string
      userId: string
      amount: number
      balance: number
      type: string
      description: string
      referenceId: string | null
      createdAt: Date
      source: string
      user: { id: string; name: string; email: string; company: string | null }
    }> = []

    let subscriptionPayments: Array<{
      id: string
      userId: string
      planId: string
      status: string
      currentPeriodStart: Date
      currentPeriodEnd: Date
      createdAt: Date
      source: string
      user: { id: string; name: string; email: string; company: string | null }
      plan: { id: string; name: string; price: number }
    }> = []

    let totalCredit = 0
    let totalSubscriptions = 0

    if (source === 'all' || source === 'credits') {
      const [credits, creditCount] = await Promise.all([
        db.creditTransaction.findMany({
          where: creditWhere,
          skip: source === 'all' ? 0 : skip,
          take: source === 'all' ? 100 : limit,
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
          },
        }),
        db.creditTransaction.count({ where: creditWhere }),
      ])

      creditTransactions = credits.map((ct) => ({
        ...ct,
        source: 'credit',
      }))
      totalCredit = creditCount
    }

    if (source === 'all' || source === 'subscriptions') {
      const [subs, subCount] = await Promise.all([
        db.subscription.findMany({
          where: subWhere,
          skip: source === 'all' ? 0 : skip,
          take: source === 'all' ? 100 : limit,
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
              },
            },
          },
        }),
        db.subscription.count({ where: subWhere }),
      ])

      subscriptionPayments = subs.map((sub) => ({
        ...sub,
        source: 'subscription',
      }))
      totalSubscriptions = subCount
    }

    // When source is 'all', merge and sort both types by date
    if (source === 'all') {
      const allTransactions = [
        ...creditTransactions.map((ct) => ({
          id: ct.id,
          source: 'credit' as const,
          userId: ct.userId,
          userName: ct.user.name,
          userEmail: ct.user.email,
          userCompany: ct.user.company,
          amount: ct.amount,
          type: ct.type,
          description: ct.description,
          createdAt: ct.createdAt,
          // Credit-specific fields
          balance: ct.balance,
          referenceId: ct.referenceId,
          // Subscription fields (null for credits)
          planName: null as string | null,
          planPrice: null as number | null,
          subscriptionStatus: null as string | null,
          currentPeriodStart: null as Date | null,
          currentPeriodEnd: null as Date | null,
        })),
        ...subscriptionPayments.map((sp) => ({
          id: sp.id,
          source: 'subscription' as const,
          userId: sp.userId,
          userName: sp.user.name,
          userEmail: sp.user.email,
          userCompany: sp.user.company,
          amount: sp.plan.price,
          type: 'subscription_payment',
          description: `Subscription: ${sp.plan.name}`,
          createdAt: sp.createdAt,
          // Credit fields (null for subscriptions)
          balance: null as number | null,
          referenceId: null as string | null,
          // Subscription-specific fields
          planName: sp.plan.name,
          planPrice: sp.plan.price,
          subscriptionStatus: sp.status,
          currentPeriodStart: sp.currentPeriodStart,
          currentPeriodEnd: sp.currentPeriodEnd,
        })),
      ]

      // Sort by createdAt desc
      allTransactions.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      // Apply pagination to the combined results
      const paginatedTransactions = allTransactions.slice(skip, skip + limit)
      const total = totalCredit + totalSubscriptions

      return NextResponse.json({
        data: paginatedTransactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    }

    // When source is specific, return that type with pagination
    if (source === 'credits') {
      const paginatedCredits = creditTransactions.slice(skip, skip + limit)
      const formattedCredits = paginatedCredits.map((ct) => ({
        id: ct.id,
        source: 'credit',
        userId: ct.userId,
        userName: ct.user.name,
        userEmail: ct.user.email,
        userCompany: ct.user.company,
        amount: ct.amount,
        type: ct.type,
        description: ct.description,
        createdAt: ct.createdAt,
        balance: ct.balance,
        referenceId: ct.referenceId,
        planName: null,
        planPrice: null,
        subscriptionStatus: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
      }))

      return NextResponse.json({
        data: formattedCredits,
        pagination: {
          page,
          limit,
          total: totalCredit,
          totalPages: Math.ceil(totalCredit / limit),
        },
      })
    }

    // source === 'subscriptions'
    const paginatedSubs = subscriptionPayments.slice(skip, skip + limit)
    const formattedSubs = paginatedSubs.map((sp) => ({
      id: sp.id,
      source: 'subscription',
      userId: sp.userId,
      userName: sp.user.name,
      userEmail: sp.user.email,
      userCompany: sp.user.company,
      amount: sp.plan.price,
      type: 'subscription_payment',
      description: `Subscription: ${sp.plan.name}`,
      createdAt: sp.createdAt,
      balance: null,
      referenceId: null,
      planName: sp.plan.name,
      planPrice: sp.plan.price,
      subscriptionStatus: sp.status,
      currentPeriodStart: sp.currentPeriodStart,
      currentPeriodEnd: sp.currentPeriodEnd,
    }))

    return NextResponse.json({
      data: formattedSubs,
      pagination: {
        page,
        limit,
        total: totalSubscriptions,
        totalPages: Math.ceil(totalSubscriptions / limit),
      },
    })
  } catch (error) {
    console.error('Admin get transactions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
