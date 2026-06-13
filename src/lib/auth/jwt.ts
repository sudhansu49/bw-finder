import { SignJWT, jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

// ─── JWT Configuration ──────────────────────────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bw-finder-secret-key-change-in-production-2024'
)

const JWT_ISSUER = 'bw-finder'
const JWT_AUDIENCE = 'bw-finder-api'

export const ACCESS_TOKEN_EXPIRY = '24h'    // Access token: 24 hours
export const REFRESH_TOKEN_EXPIRY = '30d'   // Refresh token: 30 days

// ─── Token Types ────────────────────────────────────────────────────────────

export interface JWTPayload {
  sub: string        // user ID
  email: string
  role: string
  name: string
  planId?: string | null
  planTier?: string
  type: 'access' | 'refresh'
  iat: number
  exp: number
  iss: string
  aud: string
}

// ─── Sign Access Token ─────────────────────────────────────────────────────

export async function signAccessToken(user: {
  id: string
  email: string
  role: string
  name: string
  planId?: string | null
  planTier?: string
}): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    planId: user.planId || null,
    planTier: user.planTier || 'free',
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET)
}

// ─── Sign Refresh Token ────────────────────────────────────────────────────

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({
    sub: userId,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET)
}

// ─── Verify Token ──────────────────────────────────────────────────────────

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// ─── Extract Token from Request ────────────────────────────────────────────

export function extractToken(request: NextRequest): string | null {
  // 1. Check Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // 2. Check cookies
  const cookieToken = request.cookies.get('bw-access-token')?.value
  if (cookieToken) {
    return cookieToken
  }

  return null
}

// ─── Auth Result ───────────────────────────────────────────────────────────

export interface AuthResult {
  authenticated: boolean
  payload: JWTPayload | null
  error?: string
}

// ─── Authenticate Request ──────────────────────────────────────────────────

export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  const token = extractToken(request)

  if (!token) {
    return { authenticated: false, payload: null, error: 'No authentication token provided' }
  }

  const payload = await verifyToken(token)

  if (!payload) {
    return { authenticated: false, payload: null, error: 'Invalid or expired token' }
  }

  if (payload.type !== 'access') {
    return { authenticated: false, payload: null, error: 'Invalid token type' }
  }

  return { authenticated: true, payload }
}

// ─── Set Auth Cookies ──────────────────────────────────────────────────────

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): NextResponse {
  // Access token cookie
  response.cookies.set('bw-access-token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours
  })

  // Refresh token cookie
  response.cookies.set('bw-refresh-token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  })

  return response
}

// ─── Clear Auth Cookies ────────────────────────────────────────────────────

export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.set('bw-access-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  response.cookies.set('bw-refresh-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}

// ─── Require Auth Middleware Helper ────────────────────────────────────────

export async function requireAuth(request: NextRequest): Promise<{
  success: true
  payload: JWTPayload
} | {
  success: false
  error: string
  status: number
}> {
  const result = await authenticateRequest(request)

  if (!result.authenticated) {
    return { success: false, error: result.error || 'Unauthorized', status: 401 }
  }

  return { success: true, payload: result.payload! }
}

// ─── Require Role Middleware Helper ────────────────────────────────────────

export async function requireRole(
  request: NextRequest,
  roles: string[]
): Promise<{
  success: true
  payload: JWTPayload
} | {
  success: false
  error: string
  status: number
}> {
  const authResult = await requireAuth(request)

  if (!authResult.success) return authResult

  if (!roles.includes(authResult.payload.role)) {
    return { success: false, error: 'Insufficient permissions', status: 403 }
  }

  return authResult
}

// ─── Require Admin ─────────────────────────────────────────────────────────

export async function requireAdmin(request: NextRequest): Promise<{
  success: true
  payload: JWTPayload
} | {
  success: false
  error: string
  status: number
}> {
  return requireRole(request, ['super_admin', 'admin'])
}

// ─── Require Ownership or Admin ────────────────────────────────────────────
// User can access their own data, admins can access any data

export async function requireOwnerOrAdmin(
  request: NextRequest,
  resourceUserId: string
): Promise<{
  success: true
  payload: JWTPayload
} | {
  success: false
  error: string
  status: number
}> {
  const authResult = await requireAuth(request)

  if (!authResult.success) return authResult

  const isAdmin = ['super_admin', 'admin'].includes(authResult.payload.role)
  const isOwner = authResult.payload.sub === resourceUserId

  if (!isAdmin && !isOwner) {
    return { success: false, error: 'Access denied: can only access own resources', status: 403 }
  }

  return authResult
}
