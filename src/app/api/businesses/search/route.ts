import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

interface ExtractedBusiness {
  name: string
  category: string
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  phone: string | null
  email: string | null
  website: string | null
  hasWebsite: boolean
  googleRating: number | null
  googleReviews: number | null
  reviewCount: number | null
  facebookUrl: string | null
  instagramUrl: string | null
  linkedinUrl: string | null
  source: string
}

// Helper: delay for retry backoff
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Helper: retry a function with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<T> {
  let lastError: any
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      const is429 = error?.message?.includes('429') || error?.status === 429
      if (!is429 || attempt === maxRetries) break
      const waitTime = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      console.log(`Rate limited (429), retrying in ${Math.round(waitTime)}ms (attempt ${attempt + 1}/${maxRetries})...`)
      await delay(waitTime)
    }
  }
  throw lastError
}

// Helper: sequential web search with delays between requests
async function sequentialWebSearch(
  zai: any,
  queries: string[],
  delayBetweenMs: number = 3000
): Promise<{ url: string; name: string; snippet: string; host_name: string; source: string }[][]> {
  const results: { url: string; name: string; snippet: string; host_name: string; source: string }[][] = []

  for (let i = 0; i < queries.length; i++) {
    try {
      const searchResult = await withRetry(
        () => zai.functions.invoke('web_search', { query: queries[i], num: 10 }),
        2, // max 2 retries per query
        2000 // base delay
      )
      results.push(
        (searchResult || []).map((r: any) => ({
          url: r.url,
          name: r.name,
          snippet: r.snippet,
          host_name: r.host_name,
          source: `search_query_${i + 1}`,
        }))
      )
    } catch (queryError) {
      console.error(`Search query ${i + 1} failed:`, queryError)
      results.push([]) // Empty result for this query, continue with others
    }

    // Delay between queries to avoid rate limiting
    if (i < queries.length - 1) {
      await delay(delayBetweenMs)
    }
  }

  return results
}

// Helper: get matching businesses from database as fallback
async function getDatabaseFallback(category: string, city?: string, state?: string, country?: string) {
  const where: any = {}

  if (category) {
    where.category = { contains: category }
  }
  if (city) {
    where.city = { contains: city }
  } else if (state) {
    where.state = { contains: state }
  }
  if (country) {
    where.country = { contains: country }
  }

  return db.business.findMany({
    where,
    orderBy: { leadScore: 'desc' },
    take: 30,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { country, state, city, category, userId } = body

    if (!country || !category) {
      return NextResponse.json(
        { error: 'Country and category are required' },
        { status: 400 }
      )
    }

    // Build location string from components
    const locationParts = [city, state, country].filter(Boolean)
    const locationString = locationParts.join(', ')

    // Create a search job record
    const searchJob = await db.searchJob.create({
      data: {
        userId: userId || 'anonymous',
        query: `${category} businesses in ${locationString}`,
        location: locationString,
        category,
        country: country || null,
        state: state || null,
        city: city || null,
        status: 'processing',
      },
    })

    let savedBusinesses: any[] = []
    let usedFallback = false
    let searchError: string | null = null

    try {
      const zai = await ZAI.create()

      // Multi-strategy search: use multiple queries to maximize discovery
      // Execute SEQUENTIALLY with delays to avoid rate limiting
      const searchQueries = [
        `${category} businesses in ${locationString} phone number address contact`,
      ]

      // Only add extra queries if first one is needed (keeps it simple and avoids rate limits)
      // The second query is more specific
      if (city || state) {
        searchQueries.push(`${category} in ${city || state} reviews ratings website`)
      }

      // Execute searches sequentially with delays between them
      const searchResultsArrays = await sequentialWebSearch(zai, searchQueries, 3000)

      // Combine and deduplicate search results by URL
      const allResults: { url: string; name: string; snippet: string; host_name: string; source: string }[] = []
      const seenUrls = new Set<string>()

      searchResultsArrays.forEach((results) => {
        for (const result of results) {
          if (!seenUrls.has(result.url)) {
            seenUrls.add(result.url)
            allResults.push(result)
          }
        }
      })

      if (allResults.length === 0) {
        // No web search results - try database fallback
        console.log('No web search results found, falling back to database...')
        const dbBusinesses = await getDatabaseFallback(category, city, state, country)
        if (dbBusinesses.length > 0) {
          usedFallback = true
          savedBusinesses = dbBusinesses
        }

        await db.searchJob.update({
          where: { id: searchJob.id },
          data: {
            status: usedFallback ? 'completed_with_fallback' : 'completed',
            resultsCount: savedBusinesses.length,
            sources: usedFallback ? 'database_fallback' : 'none',
            completedAt: new Date(),
          },
        })

        return NextResponse.json({
          businesses: savedBusinesses,
          searchJob: {
            id: searchJob.id,
            status: usedFallback ? 'completed_with_fallback' : 'completed',
            resultsCount: savedBusinesses.length,
            duplicatesFound: 0,
            sourcesUsed: usedFallback ? 'database_fallback' : 'none',
            fallback: usedFallback,
          },
        })
      }

      // Prepare search results text for LLM analysis
      const resultsText = allResults
        .map(
          (result, index) =>
            `[${index + 1}] Name: ${result.name}\nURL: ${result.url}\nSnippet: ${result.snippet}\nHost: ${result.host_name}\nSource: ${result.source}`
        )
        .join('\n\n')

      // Use LLM to extract structured business data from search results
      const llmResponse = await withRetry(
        () =>
          zai.chat.completions.create({
            messages: [
              {
                role: 'assistant',
                content: `You are a data extraction assistant specializing in finding business information from web search results. Extract business data from the search results below. For each business found, provide a JSON object with these exact fields:
- name: Business name (string, required)
- category: Business category/type (string, use "${category}" if unclear)
- address: Full street address if available (string or null)
- city: City (string or null, use "${city || ''}" if mentioned)
- state: State/region (string or null, use "${state || ''}" if mentioned)
- country: Country (string or null, use "${country}" if mentioned)
- phone: Phone number with country code if available (string or null)
- email: Email address if available (string or null)
- website: Website URL if available (string or null)
- hasWebsite: Whether the business has a website (boolean)
- googleRating: Google rating if mentioned, e.g. 4.5 (number or null)
- googleReviews: Number of Google reviews if mentioned (number or null)
- reviewCount: Total review count across platforms if mentioned (number or null)
- facebookUrl: Facebook page URL if found (string or null)
- instagramUrl: Instagram profile URL if found (string or null)
- linkedinUrl: LinkedIn company page URL if found (string or null)
- source: Where this data was found, e.g. "google_maps", "yelp", "justdial", "yellow_pages", "facebook", "instagram", "web_directory" (string)

IMPORTANT RULES:
1. Return ONLY a valid JSON array of business objects.
2. If no businesses can be extracted, return an empty array.
3. Do not include any explanation or markdown formatting, just the raw JSON array.
4. Extract as many businesses as possible from the search results.
5. If a business has no website URL, set hasWebsite to false and website to null.
6. Social media URLs should be full URLs starting with https://.
7. Be thorough - extract every business mentioned in the results.`,
              },
              {
                role: 'user',
                content: `Extract business information from these search results for "${category}" businesses in "${locationString}":\n\n${resultsText}`,
              },
            ],
            thinking: { type: 'disabled' },
          }),
        2,
        3000
      )

      // Parse LLM response
      const llmContent = llmResponse.choices?.[0]?.message?.content || '[]'

      // Clean the response - remove markdown code blocks if present
      let cleanedContent = llmContent.trim()
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.slice(7)
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.slice(3)
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3)
      }
      cleanedContent = cleanedContent.trim()

      let extractedBusinesses: ExtractedBusiness[] = []
      try {
        extractedBusinesses = JSON.parse(cleanedContent)
        if (!Array.isArray(extractedBusinesses)) {
          extractedBusinesses = []
        }
      } catch (parseError) {
        console.error('Failed to parse LLM response as JSON:', parseError)
        console.error('LLM content:', llmContent)
        extractedBusinesses = []
      }

      // Save extracted businesses to database with deduplication
      const duplicateCount = { skipped: 0 }

      for (const biz of extractedBusinesses) {
        if (!biz.name || biz.name.trim().length < 2) continue

        try {
          // Deduplication: Check by name + city + phone combination
          // Note: SQLite doesn't support mode: "insensitive", use contains for case-insensitive matching
          const orConditions: any[] = [
            {
              name: { contains: biz.name },
              city: biz.city ? { contains: biz.city } : undefined,
            },
          ]

          if (biz.phone && biz.phone.trim().length > 5) {
            orConditions.push({
              phone: { contains: biz.phone },
            })
          }

          const existing = await db.business.findFirst({
            where: {
              OR: orConditions.filter(
                (c) => Object.values(c).some((v) => v !== undefined)
              ),
            },
          })

          // Determine website status using detection rules
          const socialDomains = ['facebook.com','instagram.com','linkedin.com','twitter.com','x.com','whatsapp.com','youtube.com','tiktok.com','yelp.com','justdial.com','sulekha.com','tripadvisor.com','zomato.com','swiggy.com','google.com/maps','g.page']
          function isSocialUrl(url: string): boolean {
            try {
              const h = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
              return socialDomains.some(d => h === d.replace(/^www\./, '') || h.endsWith('.' + d.replace(/^www\./, '')))
            } catch { return false }
          }
          function isValidUrl(url: string): boolean {
            try { const p = new URL(url); return ['http:','https:'].includes(p.protocol) && p.hostname.includes('.') } catch { return false }
          }

          let websiteStatus: string
          let hasWebsite: boolean
          if (!biz.website || biz.website.trim() === '') {
            websiteStatus = 'NO_WEBSITE'; hasWebsite = false
          } else if (!isValidUrl(biz.website)) {
            websiteStatus = 'NO_WEBSITE'; hasWebsite = false
          } else if (isSocialUrl(biz.website)) {
            websiteStatus = 'SOCIAL_ONLY'; hasWebsite = false
          } else {
            websiteStatus = 'HAS_WEBSITE'; hasWebsite = true
          }

          const socialPresence = (biz.facebookUrl ? 1 : 0) + (biz.instagramUrl ? 1 : 0) + (biz.linkedinUrl ? 1 : 0)

          if (existing) {
            const updateData: any = {}

            if (!existing.country && biz.country) updateData.country = biz.country
            if (!existing.facebookUrl && biz.facebookUrl) updateData.facebookUrl = biz.facebookUrl
            if (!existing.instagramUrl && biz.instagramUrl) updateData.instagramUrl = biz.instagramUrl
            if (!existing.linkedinUrl && biz.linkedinUrl) updateData.linkedinUrl = biz.linkedinUrl
            if (!existing.email && biz.email) updateData.email = biz.email
            if (!existing.website && biz.website) updateData.website = biz.website
            if (!existing.googleRating && biz.googleRating) updateData.googleRating = biz.googleRating
            if (!existing.googleReviews && biz.googleReviews) updateData.googleReviews = biz.googleReviews
            if (!existing.reviewCount && biz.reviewCount) updateData.reviewCount = biz.reviewCount
            if (!existing.phone && biz.phone) updateData.phone = biz.phone
            if (!existing.address && biz.address) updateData.address = biz.address

            // Always update website status and social presence
            updateData.websiteStatus = websiteStatus
            updateData.hasWebsite = hasWebsite
            updateData.socialPresence = socialPresence

            if (existing.sourceDetail && biz.source) {
              const existingSources = existing.sourceDetail.split(',').map(s => s.trim())
              if (!existingSources.includes(biz.source)) {
                updateData.sourceDetail = [...existingSources, biz.source].join(', ')
              }
            } else if (biz.source) {
              updateData.sourceDetail = biz.source
            }

            if (Object.keys(updateData).length > 0) {
              const updated = await db.business.update({
                where: { id: existing.id },
                data: updateData,
              })
              savedBusinesses.push(updated)
            } else {
              savedBusinesses.push(existing)
            }
            duplicateCount.skipped++
            continue
          }

          // Create new business record
          const saved = await db.business.create({
            data: {
              name: biz.name.trim(),
              category: biz.category || category,
              address: biz.address || null,
              city: biz.city || city || null,
              state: biz.state || state || null,
              country: biz.country || country || null,
              phone: biz.phone || null,
              email: biz.email || null,
              website: biz.website || null,
              hasWebsite,
              websiteStatus,
              googleRating: biz.googleRating ?? null,
              googleReviews: biz.googleReviews ?? null,
              reviewCount: biz.reviewCount ?? null,
              facebookUrl: biz.facebookUrl || null,
              instagramUrl: biz.instagramUrl || null,
              linkedinUrl: biz.linkedinUrl || null,
              socialPresence,
              source: 'web_search',
              sourceDetail: biz.source || null,
            },
          })
          savedBusinesses.push(saved)
        } catch (saveError) {
          console.error(`Failed to save business "${biz.name}":`, saveError)
        }
      }

      // Auto-score all discovered businesses
      try {
        const scoringUrl = new URL('/api/businesses/score', 'http://localhost:3000')
        await fetch(scoringUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scoreAll: false, businessIds: savedBusinesses.map(b => b.id) }),
        })

        // Re-fetch businesses with scores
        const scoredBusinesses = await db.business.findMany({
          where: { id: { in: savedBusinesses.map(b => b.id) } },
        })
        savedBusinesses.length = 0
        savedBusinesses.push(...scoredBusinesses)
      } catch (scoringError) {
        console.error('Auto-scoring failed:', scoringError)
      }

      // Update search job as completed
      const sourcesUsed = [...new Set(allResults.map(r => r.host_name))].join(', ')
      await db.searchJob.update({
        where: { id: searchJob.id },
        data: {
          status: 'completed',
          resultsCount: savedBusinesses.length,
          sources: sourcesUsed,
          completedAt: new Date(),
        },
      })

      return NextResponse.json({
        businesses: savedBusinesses,
        searchJob: {
          id: searchJob.id,
          status: 'completed',
          resultsCount: savedBusinesses.length,
          duplicatesFound: duplicateCount.skipped,
          sourcesUsed: sourcesUsed,
          fallback: false,
        },
      })
    } catch (aiError: any) {
      console.error('AI search error:', aiError)
      searchError = aiError?.message || 'Unknown error'

      // FALLBACK: Try to return existing database businesses matching the criteria
      try {
        const dbBusinesses = await getDatabaseFallback(category, city, state, country)
        if (dbBusinesses.length > 0) {
          usedFallback = true
          savedBusinesses = dbBusinesses

          await db.searchJob.update({
            where: { id: searchJob.id },
            data: {
              status: 'completed_with_fallback',
              resultsCount: savedBusinesses.length,
              sources: 'database_fallback',
              completedAt: new Date(),
            },
          })

          return NextResponse.json({
            businesses: savedBusinesses,
            searchJob: {
              id: searchJob.id,
              status: 'completed_with_fallback',
              resultsCount: savedBusinesses.length,
              duplicatesFound: 0,
              sourcesUsed: 'database_fallback',
              fallback: true,
              fallbackReason: 'AI search rate limited, showing cached results',
            },
          })
        }
      } catch (fallbackError) {
        console.error('Database fallback also failed:', fallbackError)
      }

      // Update search job as failed
      await db.searchJob.update({
        where: { id: searchJob.id },
        data: {
          status: 'failed',
          resultsCount: 0,
          sources: null,
          completedAt: new Date(),
        },
      })

      // Return a more helpful error response with empty results
      return NextResponse.json({
        businesses: [],
        searchJob: {
          id: searchJob.id,
          status: 'failed',
          resultsCount: 0,
          duplicatesFound: 0,
          sourcesUsed: '',
          fallback: false,
          error: 'Search temporarily unavailable. Please try again in a few seconds.',
        },
      })
    }
  } catch (error) {
    console.error('Business search error:', error)
    return NextResponse.json(
      {
        businesses: [],
        searchJob: {
          id: '',
          status: 'failed',
          resultsCount: 0,
          duplicatesFound: 0,
          sourcesUsed: '',
          fallback: false,
          error: 'Failed to search for businesses',
        },
      },
      { status: 500 }
    )
  }
}
