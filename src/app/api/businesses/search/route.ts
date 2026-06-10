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

    try {
      const zai = await ZAI.create()

      // Multi-strategy search: use multiple queries to maximize discovery
      const searchQueries = [
        `${category} businesses in ${locationString} phone number address`,
        `${category} in ${city || state || country} contact details reviews`,
        `best ${category} near ${locationString} ratings`,
      ]

      // Execute all searches in parallel
      const searchPromises = searchQueries.map((query) =>
        zai.functions.invoke('web_search', {
          query,
          num: 10,
        })
      )

      const searchResultsArrays = await Promise.all(searchPromises)

      // Combine and deduplicate search results by URL
      const allResults: { url: string; name: string; snippet: string; host_name: string; source: string }[] = []
      const seenUrls = new Set<string>()

      searchResultsArrays.forEach((results, index) => {
        const source = `search_query_${index + 1}`
        for (const result of results) {
          if (!seenUrls.has(result.url)) {
            seenUrls.add(result.url)
            allResults.push({
              url: result.url,
              name: result.name,
              snippet: result.snippet,
              host_name: result.host_name,
              source,
            })
          }
        }
      })

      // Prepare search results text for LLM analysis
      const resultsText = allResults
        .map(
          (result, index) =>
            `[${index + 1}] Name: ${result.name}\nURL: ${result.url}\nSnippet: ${result.snippet}\nHost: ${result.host_name}\nSource: ${result.source}`
        )
        .join('\n\n')

      // Use LLM to extract structured business data from search results
      const llmResponse = await zai.chat.completions.create({
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
      })

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
      const savedBusinesses = []
      const duplicateCount = { skipped: 0 }

      for (const biz of extractedBusinesses) {
        if (!biz.name || biz.name.trim().length < 2) continue

        try {
          // Deduplication: Check by name + city + phone combination
          // This prevents the same business from being added multiple times
          const orConditions: any[] = [
            {
              name: { equals: biz.name, mode: 'insensitive' },
              city: biz.city ? { equals: biz.city, mode: 'insensitive' } : undefined,
            },
          ]

          // Also check by phone if available (phone is a strong identifier)
          if (biz.phone && biz.phone.trim().length > 5) {
            orConditions.push({
              phone: { equals: biz.phone, mode: 'insensitive' },
            })
          }

          const existing = await db.business.findFirst({
            where: {
              OR: orConditions.filter(
                (c) => Object.values(c).some((v) => v !== undefined)
              ),
            },
          })

          if (existing) {
            // Update the existing record with any new information we found
            const updateData: any = {}

            // Fill in missing fields from the new discovery
            if (!existing.country && biz.country) updateData.country = biz.country
            if (!existing.facebookUrl && biz.facebookUrl) updateData.facebookUrl = biz.facebookUrl
            if (!existing.instagramUrl && biz.instagramUrl) updateData.instagramUrl = biz.instagramUrl
            if (!existing.linkedinUrl && biz.linkedinUrl) updateData.linkedinUrl = biz.linkedinUrl
            if (!existing.email && biz.email) updateData.email = biz.email
            if (!existing.website && biz.website) {
              updateData.website = biz.website
              updateData.hasWebsite = true
            }
            if (!existing.googleRating && biz.googleRating) updateData.googleRating = biz.googleRating
            if (!existing.googleReviews && biz.googleReviews) updateData.googleReviews = biz.googleReviews
            if (!existing.reviewCount && biz.reviewCount) updateData.reviewCount = biz.reviewCount
            if (!existing.phone && biz.phone) updateData.phone = biz.phone
            if (!existing.address && biz.address) updateData.address = biz.address

            // Track sources
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
              hasWebsite: biz.hasWebsite ?? !!biz.website,
              googleRating: biz.googleRating ?? null,
              googleReviews: biz.googleReviews ?? null,
              reviewCount: biz.reviewCount ?? null,
              facebookUrl: biz.facebookUrl || null,
              instagramUrl: biz.instagramUrl || null,
              linkedinUrl: biz.linkedinUrl || null,
              source: 'web_search',
              sourceDetail: biz.source || null,
            },
          })
          savedBusinesses.push(saved)
        } catch (saveError) {
          console.error(`Failed to save business "${biz.name}":`, saveError)
        }
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
        },
      })
    } catch (aiError) {
      console.error('AI search error:', aiError)
      // Update search job as failed
      await db.searchJob.update({
        where: { id: searchJob.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
        },
      })
      throw aiError
    }
  } catch (error) {
    console.error('Business search error:', error)
    return NextResponse.json(
      { error: 'Failed to search for businesses' },
      { status: 500 }
    )
  }
}
