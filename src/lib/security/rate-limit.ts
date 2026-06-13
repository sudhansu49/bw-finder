import { NextRequest, NextResponse } from 'next/server'

// ─── Rate Limiter Configuration ────────────────────────────────────────────

interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Max requests per window
  keyGenerator?: (request: NextRequest) => string
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// ─── In-Memory Store ───────────────────────────────────────────────────────

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

// ─── Default Key Generator ─────────────────────────────────────────────────

function defaultKeyGenerator(request: NextRequest): string {
  // Try to get IP from headers (behind proxy)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  // Fallback: use user agent + a hash for uniqueness
  const ua = request.headers.get('user-agent') || 'unknown'
  return `ip:${ua.slice(0, 50)}`
}

// ─── Pre-configured Rate Limits ────────────────────────────────────────────

export const RATE_LIMITS = {
  // Auth routes: 5 attempts per minute per IP
  auth: { windowMs: 60 * 1000, maxRequests: 10 },

  // Login: stricter - 5 attempts per minute
  login: { windowMs: 60 * 1000, maxRequests: 5 },

  // Register: 3 per minute
  register: { windowMs: 60 * 1000, maxRequests: 3 },

  // General API: 100 requests per minute
  api: { windowMs: 60 * 1000, maxRequests: 100 },

  // Search/Lead finder: 30 per minute (expensive operations)
  search: { windowMs: 60 * 1000, maxRequests: 30 },

  // Export: 10 per minute (resource heavy)
  export: { windowMs: 60 * 1000, maxRequests: 10 },

  // Stripe checkout: 5 per minute
  checkout: { windowMs: 60 * 1000, maxRequests: 5 },

  // Admin routes: 200 per minute
  admin: { windowMs: 60 * 1000, maxRequests: 200 },

  // Webhook: 50 per minute
  webhook: { windowMs: 60 * 1000, maxRequests: 50 },
} as const

// ─── Rate Limit Check ──────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number  // seconds until retry is allowed
}

export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.api
): RateLimitResult {
  const key = (config.keyGenerator || defaultKeyGenerator)(request)
  const now = Date.now()

  const entry = store.get(key)

  // No entry or expired window - create new
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs
    store.set(key, { count: 1, resetTime })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    }
  }

  // Within window - increment count
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

// ─── Rate Limit Response Headers ───────────────────────────────────────────

export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult,
  config: RateLimitConfig = RATE_LIMITS.api
): NextResponse {
  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())

  if (!result.allowed && result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString())
  }

  return response
}

// ─── Rate Limited 429 Response ─────────────────────────────────────────────

export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const response = NextResponse.json(
    {
      error: 'Too many requests',
      message: `Rate limit exceeded. Please retry after ${result.retryAfter || 60} seconds.`,
      retryAfter: result.retryAfter,
    },
    { status: 429 }
  )

  return addRateLimitHeaders(response, result)
}

// ─── Convenience: Apply rate limit to a route ──────────────────────────────

export function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.api
): RateLimitResult | null {
  const result = checkRateLimit(request, config)
  if (!result.allowed) {
    return result // Caller should return rateLimitResponse(result)
  }
  return null // Allowed, continue processing
}
