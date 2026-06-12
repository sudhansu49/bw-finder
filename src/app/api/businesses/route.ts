import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const country = searchParams.get('country')
    const hasWebsite = searchParams.get('hasWebsite')
    const search = searchParams.get('search')
    const source = searchParams.get('source')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where: Prisma.BusinessWhereInput = {}

    if (category) {
      where.category = { contains: category }
    }

    if (city) {
      where.city = { contains: city }
    }

    if (state) {
      where.state = { contains: state }
    }

    if (country) {
      where.country = { contains: country }
    }

    if (hasWebsite !== null && hasWebsite !== undefined && hasWebsite !== '') {
      where.hasWebsite = hasWebsite === 'true'
    }

    if (source) {
      where.source = { contains: source }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { category: { contains: search } },
        { country: { contains: search } },
      ]
    }

    const [businesses, total] = await Promise.all([
      db.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.business.count({ where }),
    ])

    return NextResponse.json({
      businesses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get businesses error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      category,
      address,
      city,
      state,
      country,
      phone,
      email,
      website,
      hasWebsite,
      googleRating,
      googleReviews,
      reviewCount,
      facebookUrl,
      instagramUrl,
      linkedinUrl,
      latitude,
      longitude,
      source,
      sourceDetail,
      notes,
    } = body

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      )
    }

    const business = await db.business.create({
      data: {
        name,
        category,
        address: address || null,
        city: city || null,
        state: state || null,
        country: country || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        hasWebsite: hasWebsite ?? (website ? true : false),
        googleRating: googleRating ?? null,
        googleReviews: googleReviews ?? null,
        reviewCount: reviewCount ?? null,
        facebookUrl: facebookUrl || null,
        instagramUrl: instagramUrl || null,
        linkedinUrl: linkedinUrl || null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        source: source || 'manual',
        sourceDetail: sourceDetail || null,
        notes: notes || null,
      },
    })

    return NextResponse.json({ business }, { status: 201 })
  } catch (error) {
    console.error('Create business error:', error)
    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    )
  }
}
