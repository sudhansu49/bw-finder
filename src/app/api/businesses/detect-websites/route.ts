import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Social media domains that should NOT count as having a website
const SOCIAL_DOMAINS = [
  'facebook.com', 'fb.com', 'm.facebook.com', 'web.facebook.com',
  'instagram.com', 'www.instagram.com',
  'linkedin.com', 'www.linkedin.com',
  'twitter.com', 'x.com',
  'whatsapp.com', 'wa.me',
  'youtube.com', 'www.youtube.com',
  'tiktok.com', 'www.tiktok.com',
  'pinterest.com',
  'yelp.com', 'www.yelp.com',
  'justdial.com', 'www.justdial.com',
  'sulekha.com', 'www.sulekha.com',
  'google.com/maps', 'maps.google.com', 'g.page',
  'tripadvisor.com', 'www.tripadvisor.com',
  'zomato.com', 'www.zomato.com',
  'swiggy.com', 'www.swiggy.com',
]

function isSocialOnlyUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')
    return SOCIAL_DOMAINS.some(domain => {
      const cleanDomain = domain.replace(/^www\./, '')
      return hostname === cleanDomain || hostname.endsWith('.' + cleanDomain)
    })
  } catch {
    return false
  }
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return false
    if (!parsed.hostname.includes('.')) return false
    if (parsed.hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(parsed.hostname)) return false
    return true
  } catch {
    return false
  }
}

function countSocialPresence(business: {
  facebookUrl?: string | null
  instagramUrl?: string | null
  linkedinUrl?: string | null
}): number {
  let count = 0
  if (business.facebookUrl) count++
  if (business.instagramUrl) count++
  if (business.linkedinUrl) count++
  return count
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessIds, detectAll } = body

    let businesses
    if (detectAll) {
      businesses = await db.business.findMany()
    } else if (businessIds && Array.isArray(businessIds)) {
      businesses = await db.business.findMany({
        where: { id: { in: businessIds } },
      })
    } else {
      return NextResponse.json(
        { error: 'Provide businessIds array or set detectAll to true' },
        { status: 400 }
      )
    }

    const results = {
      total: businesses.length,
      noWebsite: 0,
      hasWebsite: 0,
      socialOnly: 0,
      updated: 0,
    }

    for (const business of businesses) {
      let websiteStatus: string
      let hasWebsite: boolean
      const socialCount = countSocialPresence(business)

      if (!business.website || business.website.trim() === '') {
        websiteStatus = 'NO_WEBSITE'
        hasWebsite = false
      } else if (!isValidUrl(business.website)) {
        websiteStatus = 'NO_WEBSITE'
        hasWebsite = false
      } else if (isSocialOnlyUrl(business.website)) {
        websiteStatus = 'SOCIAL_ONLY'
        hasWebsite = false
        results.socialOnly++
      } else {
        websiteStatus = 'HAS_WEBSITE'
        hasWebsite = true
        results.hasWebsite++
      }

      if (websiteStatus === 'NO_WEBSITE') {
        results.noWebsite++
      }

      await db.business.update({
        where: { id: business.id },
        data: {
          websiteStatus,
          hasWebsite,
          socialPresence: socialCount,
        },
      })

      results.updated++
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Website detection error:', error)
    return NextResponse.json(
      { error: 'Failed to detect website status' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId query parameter is required' },
        { status: 400 }
      )
    }

    const business = await db.business.findUnique({ where: { id: businessId } })
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const socialCount = countSocialPresence(business)
    let websiteStatus: string
    let hasWebsite: boolean
    let detectionDetails: string

    if (!business.website || business.website.trim() === '') {
      websiteStatus = 'NO_WEBSITE'
      hasWebsite = false
      detectionDetails = 'Website URL is missing'
    } else if (!isValidUrl(business.website)) {
      websiteStatus = 'NO_WEBSITE'
      hasWebsite = false
      detectionDetails = `Website URL "${business.website}" is invalid`
    } else if (isSocialOnlyUrl(business.website)) {
      websiteStatus = 'SOCIAL_ONLY'
      hasWebsite = false
      detectionDetails = `Website URL "${business.website}" is only a social media page`
    } else {
      websiteStatus = 'HAS_WEBSITE'
      hasWebsite = true
      detectionDetails = `Valid website found: ${business.website}`
    }

    const updated = await db.business.update({
      where: { id: business.id },
      data: { websiteStatus, hasWebsite, socialPresence: socialCount },
    })

    return NextResponse.json({
      business: updated,
      detection: { websiteStatus, hasWebsite, detectionDetails, socialPresence: socialCount },
    })
  } catch (error) {
    console.error('Website detection error:', error)
    return NextResponse.json(
      { error: 'Failed to detect website status' },
      { status: 500 }
    )
  }
}
