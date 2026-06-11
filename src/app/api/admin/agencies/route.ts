import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where: Prisma.AgencyWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    const [agencies, total] = await Promise.all([
      db.agency.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logo: true,
          website: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              members: true,
              teams: true,
            },
          },
        },
      }),
      db.agency.count({ where }),
    ])

    const formattedAgencies = agencies.map((agency) => ({
      id: agency.id,
      name: agency.name,
      slug: agency.slug,
      description: agency.description,
      logo: agency.logo,
      website: agency.website,
      status: agency.status,
      owner: agency.owner,
      memberCount: agency._count.members,
      teamCount: agency._count.teams,
      createdAt: agency.createdAt,
      updatedAt: agency.updatedAt,
    }))

    return NextResponse.json({
      data: formattedAgencies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin get agencies error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agencies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, ownerId } = body

    if (!name || !slug || !ownerId) {
      return NextResponse.json(
        { error: 'name, slug, and ownerId are required' },
        { status: 400 }
      )
    }

    // Check if slug is already taken
    const existingSlug = await db.agency.findUnique({ where: { slug } })
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Agency slug already exists' },
        { status: 409 }
      )
    }

    // Check if owner exists and doesn't already own an agency
    const owner = await db.user.findUnique({ where: { id: ownerId } })
    if (!owner) {
      return NextResponse.json(
        { error: 'Owner user not found' },
        { status: 404 }
      )
    }

    const existingOwnedAgency = await db.agency.findUnique({ where: { ownerId } })
    if (existingOwnedAgency) {
      return NextResponse.json(
        { error: 'This user already owns an agency' },
        { status: 409 }
      )
    }

    // Create agency and update owner's role and agencyId in a transaction
    const result = await db.$transaction(async (tx) => {
      const agency = await tx.agency.create({
        data: {
          name,
          slug,
          description: description || null,
          ownerId,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              members: true,
              teams: true,
            },
          },
        },
      })

      // Update the owner's agencyId and role
      await tx.user.update({
        where: { id: ownerId },
        data: {
          agencyId: agency.id,
          role: 'agency_owner',
        },
      })

      return agency
    })

    return NextResponse.json(
      {
        data: {
          id: result.id,
          name: result.name,
          slug: result.slug,
          description: result.description,
          status: result.status,
          owner: result.owner,
          memberCount: result._count.members,
          teamCount: result._count.teams,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin create agency error:', error)
    return NextResponse.json(
      { error: 'Failed to create agency' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { agencyId, name, description, status } = body

    if (!agencyId) {
      return NextResponse.json(
        { error: 'agencyId is required' },
        { status: 400 }
      )
    }

    const agency = await db.agency.findUnique({ where: { id: agencyId } })
    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    const updateData: Prisma.AgencyUpdateInput = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status

    const updatedAgency = await db.agency.update({
      where: { id: agencyId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
            teams: true,
          },
        },
      },
    })

    return NextResponse.json({
      data: {
        id: updatedAgency.id,
        name: updatedAgency.name,
        slug: updatedAgency.slug,
        description: updatedAgency.description,
        status: updatedAgency.status,
        owner: updatedAgency.owner,
        memberCount: updatedAgency._count.members,
        teamCount: updatedAgency._count.teams,
        createdAt: updatedAgency.createdAt,
        updatedAt: updatedAgency.updatedAt,
      },
    })
  } catch (error) {
    console.error('Admin update agency error:', error)
    return NextResponse.json(
      { error: 'Failed to update agency' },
      { status: 500 }
    )
  }
}
