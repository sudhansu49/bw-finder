import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where: Prisma.CreditTransactionWhereInput = {}

    if (userId) {
      where.userId = userId
    }

    if (type) {
      where.type = type
    }

    const [transactions, total] = await Promise.all([
      db.creditTransaction.findMany({
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
        },
      }),
      db.creditTransaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin get credits error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, type, description } = body

    if (!userId || amount === undefined || !type || !description) {
      return NextResponse.json(
        { error: 'userId, amount, type, and description are required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const newBalance = user.credits + amount

    // Use a transaction to ensure atomicity
    const transaction = await db.$transaction(async (tx) => {
      // Update user's credit balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: newBalance },
        select: {
          id: true,
          name: true,
          email: true,
          credits: true,
        },
      })

      // Create the credit transaction record
      const creditTransaction = await tx.creditTransaction.create({
        data: {
          userId,
          amount,
          balance: newBalance,
          type,
          description,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return { updatedUser, creditTransaction }
    })

    return NextResponse.json(
      {
        transaction: transaction.creditTransaction,
        user: transaction.updatedUser,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin add credits error:', error)
    return NextResponse.json(
      { error: 'Failed to add credits' },
      { status: 500 }
    )
  }
}
