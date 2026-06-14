import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: Prisma.ServiceWhereInput = {}

    if (category) {
      where.category = { contains: category }
    }

    const services = await db.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category, basePrice, features, popular } = body

    if (!name || !description || !category || basePrice === undefined) {
      return NextResponse.json(
        { error: 'Name, description, category, and basePrice are required' },
        { status: 400 }
      )
    }

    const service = await db.service.create({
      data: {
        name,
        description,
        category,
        basePrice: parseFloat(String(basePrice)),
        features: features || '',
        popular: popular ?? false,
      },
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
