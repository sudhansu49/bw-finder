import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, clearAuthCookies } from '@/lib/auth/jwt'
import { auditLogout, getRequestInfo } from '@/lib/security/audit'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    const { ip } = getRequestInfo(request)

    // Even if auth fails, we still clear cookies
    if (authResult.success) {
      await auditLogout(authResult.payload.sub, ip)
    }

    const response = NextResponse.json({
      message: 'Logged out successfully',
    })

    return clearAuthCookies(response)
  } catch (error) {
    console.error('Logout error:', error)
    // Still clear cookies even on error
    const response = NextResponse.json({
      message: 'Logged out',
    })
    return clearAuthCookies(response)
  }
}
