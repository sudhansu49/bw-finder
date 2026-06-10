import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

interface ExtractedBusiness {
  name: string
  category: string
  address: string | null
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  website: string | null
  hasWebsite: boolean
  googleRating: number | null
  googleReviews: number | null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { location, category, userId } = body

    if (!location || !category) {
      return NextResponse.json(
        { error: 'Location and category are required' },
        { status: 400 }
      )
    }

    // Create a search job record
    const searchJob = await db.searchJob.create({
      data: {
        userId: userId || 'anonymous',
        query: `${category} businesses in ${location}`,
        location,
        category,
        status: 'processing',
      },
    })

    try {
      // Initialize ZAI SDK
      const zai = await ZAI.create()

      // Perform web search
      const searchQuery = `${category} businesses in ${location} contact phone`
      const searchResults = await zai.functions.invoke('web_search', {
        query: searchQuery,
        num: 10,
      })

      // Prepare search results text for LLM analysis
      const resultsText = searchResults
        .map(
          (result, index) =>
            `[${index + 1}] Name: ${result.name}\nURL: ${result.url}\nSnippet: ${result.snippet}\nHost: ${result.host_name}`
        )
        .join('\n\n')

      // Use LLM to extract structured business data from search results
      const llmResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a data extraction assistant specializing in finding business information from web search results. Extract business data from the search results below. For each business found, provide a JSON object with these fields:
- name: Business name (string)
- category: Business category/type (string, use "${category}" if unclear)
- address: Full street address if available (string or null)
- city: City (string or null)
- state: State/region (string or null)
- phone: Phone number (string or null)
- email: Email address if available (string or null)
- website: Website URL if available (string or null)
- hasWebsite: Whether the business has a website (boolean)
- googleRating: Google rating if mentioned (number or null)
- googleReviews: Number of Google reviews if mentioned (number or null)

Return ONLY a valid JSON array of business objects. If no businesses can be extracted, return an empty array. Do not include any explanation or markdown formatting, just the raw JSON array.`,
          },
          {
            role: 'user',
            content: `Extract business information from these search results for "${category}" businesses in "${location}":\n\n${resultsText}`,
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

      // Save extracted businesses to database
      const savedBusinesses = []
      for (const biz of extractedBusinesses) {
        if (!biz.name) continue

        try {
          // Check if business already exists (by name + city combination)
          const existing = await db.business.findFirst({
            where: {
              name: { equals: biz.name, mode: 'insensitive' },
              city: biz.city ? { equals: biz.city, mode: 'insensitive' } : undefined,
            },
          })

          if (existing) {
            savedBusinesses.push(existing)
            continue
          }

          const saved = await db.business.create({
            data: {
              name: biz.name,
              category: biz.category || category,
              address: biz.address || null,
              city: biz.city || null,
              state: biz.state || null,
              phone: biz.phone || null,
              email: biz.email || null,
              website: biz.website || null,
              hasWebsite: biz.hasWebsite ?? !!biz.website,
              googleRating: biz.googleRating ?? null,
              googleReviews: biz.googleReviews ?? null,
              source: 'web_search',
            },
          })
          savedBusinesses.push(saved)
        } catch (saveError) {
          console.error(`Failed to save business "${biz.name}":`, saveError)
        }
      }

      // Update search job as completed
      await db.searchJob.update({
        where: { id: searchJob.id },
        data: {
          status: 'completed',
          resultsCount: savedBusinesses.length,
          completedAt: new Date(),
        },
      })

      return NextResponse.json({
        businesses: savedBusinesses,
        searchJob: {
          id: searchJob.id,
          status: 'completed',
          resultsCount: savedBusinesses.length,
        },
      })
    } catch (aiError) {
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
