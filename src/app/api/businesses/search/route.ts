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
  maxRetries: number = 2,
  baseDelay: number = 1500
): Promise<T> {
  let lastError: any
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      const is429 = error?.message?.includes('429') || error?.status === 429
      if (!is429 || attempt === maxRetries) break
      const waitTime = baseDelay * Math.pow(2, attempt) + Math.random() * 500
      console.log(`Rate limited (429), retrying in ${Math.round(waitTime)}ms (attempt ${attempt + 1}/${maxRetries})...`)
      await delay(waitTime)
    }
  }
  throw lastError
}

// Helper: parallel web search with reduced delays - runs searches concurrently for speed
async function parallelWebSearch(
  zai: any,
  queries: string[],
): Promise<{ url: string; name: string; snippet: string; host_name: string; source: string }[][]> {
  // Run all searches in parallel for maximum speed
  const results = await Promise.all(
    queries.map(async (query, i) => {
      try {
        // Small staggered delay to avoid burst rate limiting
        if (i > 0) await delay(400 * i)
        
        const searchResult = await withRetry(
          () => zai.functions.invoke('web_search', { query, num: 15 }),
          1, // max 1 retry for speed
          1500
        )
        return (searchResult || []).map((r: any) => ({
          url: r.url,
          name: r.name,
          snippet: r.snippet,
          host_name: r.host_name,
          source: `search_query_${i + 1}`,
        }))
      } catch (queryError) {
        console.error(`Search query ${i + 1} failed:`, queryError)
        return [] // Empty result for this query, continue with others
      }
    })
  )

  return results
}

// Helper: get matching businesses from database as fallback (cascading broader matching)
async function getDatabaseFallback(category: string, city?: string, state?: string, country?: string): Promise<{ businesses: any[]; fallbackLevel: string }> {
  // Level 1: category + city + country (most specific)
  if (category && city && country) {
    const matches = await db.business.findMany({
      where: { category: { contains: category }, city: { contains: city }, country: { contains: country } },
      orderBy: { leadScore: 'desc' },
      take: 30,
    })
    if (matches.length > 0) return { businesses: matches, fallbackLevel: 'category_city_country' }
  }

  // Level 2: category + state + country
  if (category && state && country) {
    const matches = await db.business.findMany({
      where: { category: { contains: category }, state: { contains: state }, country: { contains: country } },
      orderBy: { leadScore: 'desc' },
      take: 30,
    })
    if (matches.length > 0) return { businesses: matches, fallbackLevel: 'category_state_country' }
  }

  // Level 3: category + country (any city)
  if (category && country) {
    const matches = await db.business.findMany({
      where: { category: { contains: category }, country: { contains: country } },
      orderBy: { leadScore: 'desc' },
      take: 30,
    })
    if (matches.length > 0) return { businesses: matches, fallbackLevel: 'category_country' }
  }

  // Level 4: same city + country, any category
  if (city && country) {
    const matches = await db.business.findMany({
      where: { city: { contains: city }, country: { contains: country } },
      orderBy: { leadScore: 'desc' },
      take: 30,
    })
    if (matches.length > 0) return { businesses: matches, fallbackLevel: 'city_country_any_category' }
  }

  // Level 5: same category, any location
  if (category) {
    const matches = await db.business.findMany({
      where: { category: { contains: category } },
      orderBy: { leadScore: 'desc' },
      take: 30,
    })
    if (matches.length > 0) return { businesses: matches, fallbackLevel: 'category_any_location' }
  }

  // Level 6: same country, any category, any city
  if (country) {
    const matches = await db.business.findMany({
      where: { country: { contains: country } },
      orderBy: { leadScore: 'desc' },
      take: 30,
    })
    if (matches.length > 0) return { businesses: matches, fallbackLevel: 'country_any_category' }
  }

  // Level 7: any businesses at all (random selection)
  const totalCount = await db.business.count()
  if (totalCount > 0) {
    // Use a random skip to get varied results each time
    const skip = Math.max(0, Math.floor(Math.random() * Math.max(1, totalCount - 20)))
    const matches = await db.business.findMany({
      orderBy: { leadScore: 'desc' },
      skip,
      take: 20,
    })
    if (matches.length > 0) return { businesses: matches, fallbackLevel: 'generic_suggestions' }
  }

  return { businesses: [], fallbackLevel: 'none' }
}

// Website status detection helpers
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

function determineWebsiteStatus(website: string | null | undefined): { websiteStatus: string; hasWebsite: boolean } {
  if (!website || website.trim() === '') {
    return { websiteStatus: 'NO_WEBSITE', hasWebsite: false }
  } else if (!isValidUrl(website)) {
    return { websiteStatus: 'NO_WEBSITE', hasWebsite: false }
  } else if (isSocialUrl(website)) {
    return { websiteStatus: 'SOCIAL_ONLY', hasWebsite: false }
  } else {
    return { websiteStatus: 'HAS_WEBSITE', hasWebsite: true }
  }
}

export async function POST(request: NextRequest) {
  // Try to extract userId from JWT for search tracking
  let validUserId: string | null = null
  try {
    const { requireAuth } = await import('@/lib/auth/jwt')
    const authResult = await requireAuth(request)
    if (authResult.success) {
      validUserId = authResult.payload.sub
    }
  } catch {
    // Proceed without auth for search
  }

  try {
    const body = await request.json()
    const { country, state, city, category } = body

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
        userId: validUserId,
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

    try {
      const zai = await ZAI.create()
      console.log(`[Search] Starting search for "${category}" in "${locationString}"`)

      // Diverse search queries for broader coverage
      const searchQueries = [
        `${category} businesses in ${locationString} phone number address contact`,
        `${category} in ${locationString} list directory reviews`,
        `best ${category} near ${city || state || country} contact details`,
        `${category} ${locationString} yellow pages google maps`,
        `"justdial.com" OR "sulekha.com" OR "yelp.com" OR "yellowpages.com" ${category} list in ${locationString}`
      ]

      // Execute searches IN PARALLEL for speed (was sequential with 3s delays)
      const startTime = Date.now()
      const searchResultsArrays = await parallelWebSearch(zai, searchQueries)
      console.log(`[Search] Web searches completed in ${Date.now() - startTime}ms`)

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

      console.log(`[Search] Found ${allResults.length} unique search results`)

      if (allResults.length === 0) {
        // No web search results - try database fallback
        console.log('[Search] No web results, falling back to database...')
        const fallbackResult = await getDatabaseFallback(category, city, state, country)
        const dbBusinesses = fallbackResult.businesses
        const fallbackLevel = fallbackResult.fallbackLevel
        if (dbBusinesses.length > 0) {
          usedFallback = true
          savedBusinesses = dbBusinesses
        }

        const isGeneric = fallbackLevel === 'generic_suggestions'
        await db.searchJob.update({
          where: { id: searchJob.id },
          data: {
            status: usedFallback ? 'completed_with_fallback' : 'completed',
            resultsCount: savedBusinesses.length,
            sources: usedFallback ? `database_fallback_${fallbackLevel}` : 'none',
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
            sourcesUsed: usedFallback ? `database_fallback_${fallbackLevel}` : 'none',
            fallback: usedFallback,
            fallbackLevel,
            fallbackReason: isGeneric
              ? 'No matching businesses found. Showing general suggestions from database.'
              : fallbackLevel !== 'category_city_country'
                ? 'No exact matches found. Showing broader results from database.'
                : undefined,
          },
        })
      }

      // Prepare search results text for LLM analysis (limit to first 40 results for speed)
      const limitedResults = allResults.slice(0, 40)
      const resultsText = limitedResults
        .map(
          (result, index) =>
            `[${index + 1}] Name: ${result.name}\nURL: ${result.url}\nSnippet: ${result.snippet}\nHost: ${result.host_name}\nSource: ${result.source}`
        )
        .join('\n\n')

      // Use LLM to extract structured business data from search results
      const llmStart = Date.now()
      const llmResponse = await withRetry(
        () =>
          zai.chat.completions.create({
            messages: [
              {
                role: 'system',
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
- hasWebsite: Whether the business has a real website (boolean, false if only social media)
- googleRating: Google rating if mentioned, e.g. 4.5 (number or null)
- googleReviews: Number of Google reviews if mentioned (number or null)
- reviewCount: Total review count across platforms if mentioned (number or null)
- facebookUrl: Facebook page URL if found (string or null)
- instagramUrl: Instagram profile URL if found (string or null)
- linkedinUrl: LinkedIn company page URL if found (string or null)
- source: Where this data was found, e.g. "google_maps", "yelp", "justdial", "yellow_pages", "facebook", "instagram", "web_directory" (string)

IMPORTANT RULES:
1. Return ONLY a valid JSON array of business objects. No markdown, no explanation.
2. If no businesses can be extracted, return an empty array.
3. Extract as many businesses as possible (up to 40 unique businesses) from the search results.
4. If a business has no website URL or only social media, set hasWebsite to false and website to null.
5. Social media URLs should be full URLs starting with https://.
6. Be thorough - extract every single business name, address, and phone number mentioned in any of the search snippets. Do not aggregate or skip any matches.`,
              },
              {
                role: 'user',
                content: `Extract business information from these search results for "${category}" businesses in "${locationString}":\n\n${resultsText}`,
              },
            ],
            thinking: { type: 'disabled' },
          }),
        1, // Only 1 retry for speed
        2000
      )
      console.log(`[Search] LLM extraction completed in ${Date.now() - llmStart}ms`)

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

      // Robust JSON extraction: find the first [ and last ] to extract the array
      let extractedBusinesses: ExtractedBusiness[] = []
      try {
        const firstBracket = cleanedContent.indexOf('[')
        const lastBracket = cleanedContent.lastIndexOf(']')
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
          const jsonStr = cleanedContent.slice(firstBracket, lastBracket + 1)
          extractedBusinesses = JSON.parse(jsonStr)
        } else {
          extractedBusinesses = JSON.parse(cleanedContent)
        }
        if (!Array.isArray(extractedBusinesses)) {
          extractedBusinesses = []
        }
      } catch (parseError) {
        console.error('[Search] Failed to parse LLM response as JSON:', parseError)
        console.error('[Search] LLM content (first 500 chars):', llmContent.slice(0, 500))
        extractedBusinesses = []
      }

      console.log(`[Search] Extracted ${extractedBusinesses.length} businesses from LLM`)

      // Second LLM pass: if first extraction returned 0, try simpler instructions
      if (extractedBusinesses.length === 0 && allResults.length > 0) {
        console.log('[Search] First LLM pass returned 0 businesses, trying simpler extraction...')
        try {
          const secondLlmResponse = await withRetry(
            () =>
              zai.chat.completions.create({
                messages: [
                  {
                    role: 'system',
                    content: `List every business name you can find in the search results. For each business provide: name, city, phone, website, category. Return a JSON array. If no website is found, set website to null and hasWebsite to false.`,
                  },
                  {
                    role: 'user',
                    content: `Find all businesses in these results for "${category}" in "${locationString}":\n\n${resultsText}`,
                  },
                ],
                thinking: { type: 'disabled' },
              }),
            0, // no retries for second pass
            1000
          )
          const secondContent = secondLlmResponse.choices?.[0]?.message?.content || '[]'
          let secondCleaned = secondContent.trim()
          if (secondCleaned.startsWith('```json')) secondCleaned = secondCleaned.slice(7)
          else if (secondCleaned.startsWith('```')) secondCleaned = secondCleaned.slice(3)
          if (secondCleaned.endsWith('```')) secondCleaned = secondCleaned.slice(0, -3)
          secondCleaned = secondCleaned.trim()
          try {
            const fb = secondCleaned.indexOf('[')
            const lb = secondCleaned.lastIndexOf(']')
            if (fb !== -1 && lb !== -1 && lb > fb) {
              extractedBusinesses = JSON.parse(secondCleaned.slice(fb, lb + 1))
            } else {
              extractedBusinesses = JSON.parse(secondCleaned)
            }
            if (!Array.isArray(extractedBusinesses)) extractedBusinesses = []
            console.log(`[Search] Second LLM pass extracted ${extractedBusinesses.length} businesses`)
          } catch {
            console.log('[Search] Second LLM pass also failed to parse')
            extractedBusinesses = []
          }
        } catch (secondPassError) {
          console.log('[Search] Second LLM pass failed:', secondPassError)
        }
      }

      // If still no businesses extracted, fall back to database before returning empty
      if (extractedBusinesses.length === 0) {
        console.log('[Search] No businesses extracted from LLM, falling back to database...')
        const fallbackResult = await getDatabaseFallback(category, city, state, country)
        const dbBusinesses = fallbackResult.businesses
        const fallbackLevel = fallbackResult.fallbackLevel
        if (dbBusinesses.length > 0) {
          usedFallback = true
          savedBusinesses = dbBusinesses
        }

        const isGeneric = fallbackLevel === 'generic_suggestions'
        await db.searchJob.update({
          where: { id: searchJob.id },
          data: {
            status: usedFallback ? 'completed_with_fallback' : 'completed',
            resultsCount: savedBusinesses.length,
            sources: usedFallback ? `database_fallback_${fallbackLevel}` : 'none',
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
            sourcesUsed: usedFallback ? `database_fallback_${fallbackLevel}` : 'none',
            fallback: usedFallback,
            fallbackLevel,
            fallbackReason: isGeneric
              ? 'No businesses could be extracted from web results. Showing general suggestions from database.'
              : savedBusinesses.length === 0
                ? 'No businesses found from web search or database.'
                : undefined,
          },
        })
      }

      // Save extracted businesses to database with deduplication
      const duplicateCount = { skipped: 0 }

      for (const biz of extractedBusinesses) {
        if (!biz.name || biz.name.trim().length < 2) continue

        try {
          // Deduplication: Check by name + city + phone combination
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

          const { websiteStatus, hasWebsite } = determineWebsiteStatus(biz.website)
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
          console.error(`[Search] Failed to save business "${biz.name}":`, saveError)
        }
      }

      // Auto-score all discovered businesses (non-blocking - don't wait for this)
      const scoringPromise = (async () => {
        try {
          const scoringUrl = new URL('/api/businesses/score', request.url || 'http://localhost:3000')
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
          console.error('[Search] Auto-scoring failed:', scoringError)
        }
      })()

      // Wait for scoring but with a timeout
      await Promise.race([
        scoringPromise,
        new Promise<void>((resolve) => setTimeout(() => resolve(), 5000)) // 5s timeout for scoring
      ])

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

      console.log(`[Search] Completed! Found ${savedBusinesses.length} businesses in ${Date.now() - startTime}ms`)

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
      console.error('[Search] AI search error:', aiError?.message || aiError)
      const searchError = aiError?.message || 'Unknown error'

      // FALLBACK: Try to return existing database businesses matching the criteria
      try {
        const fallbackResult = await getDatabaseFallback(category, city, state, country)
        const dbBusinesses = fallbackResult.businesses
        const fallbackLevel = fallbackResult.fallbackLevel
        if (dbBusinesses.length > 0) {
          usedFallback = true
          savedBusinesses = dbBusinesses

          await db.searchJob.update({
            where: { id: searchJob.id },
            data: {
              status: 'completed_with_fallback',
              resultsCount: savedBusinesses.length,
              sources: `database_fallback_${fallbackLevel}`,
              completedAt: new Date(),
            },
          })

          const isGeneric = fallbackLevel === 'generic_suggestions'
          return NextResponse.json({
            businesses: savedBusinesses,
            searchJob: {
              id: searchJob.id,
              status: 'completed_with_fallback',
              resultsCount: savedBusinesses.length,
              duplicatesFound: 0,
              sourcesUsed: `database_fallback_${fallbackLevel}`,
              fallback: true,
              fallbackLevel,
              fallbackReason: isGeneric
                ? 'AI search rate limited. Showing general suggestions from database.'
                : 'AI search rate limited, showing cached results from database.',
            },
          })
        }
      } catch (fallbackError) {
        console.error('[Search] Database fallback also failed:', fallbackError)
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
    console.error('[Search] Business search error:', error)
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
