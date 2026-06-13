import { db } from '@/lib/db'
import type { JWTPayload } from '@/lib/auth/jwt'

// ─── Audit Log Categories ──────────────────────────────────────────────────

export type AuditCategory =
  | 'auth'          // Login, logout, register, password changes
  | 'user'          // User profile changes, role changes
  | 'subscription'  // Plan changes, upgrades, downgrades, cancellations
  | 'billing'       // Payment, credits, invoices
  | 'credit'        // Credit transactions
  | 'admin'         // Admin actions (user management, system changes)
  | 'system'        // System health, configuration changes
  | 'security'      // Rate limit hits, suspicious activity, failed auth
  | 'api'           // API usage patterns

// ─── Audit Severity Levels ─────────────────────────────────────────────────

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical'

// ─── Audit Log Entry ───────────────────────────────────────────────────────

export interface AuditLogEntry {
  actorId?: string | null
  action: string
  category: AuditCategory
  details?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  severity?: AuditSeverity
}

// ─── Create Audit Log ──────────────────────────────────────────────────────

export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await db.systemAuditLog.create({
      data: {
        actorId: entry.actorId || null,
        action: entry.action,
        category: entry.category,
        details: entry.details || null,
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
        severity: entry.severity || 'info',
      },
    })
  } catch (error) {
    // Audit logging should never break the main flow
    console.error('Failed to create audit log:', error)
  }
}

// ─── Convenience Functions ─────────────────────────────────────────────────

/** Log a successful login */
export async function auditLogin(
  userId: string,
  ip?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    actorId: userId,
    action: 'LOGIN_SUCCESS',
    category: 'auth',
    details: 'User logged in successfully',
    ipAddress: ip,
    userAgent,
    severity: 'info',
  })
}

/** Log a failed login attempt */
export async function auditLoginFailure(
  email: string,
  ip?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    actorId: null,
    action: 'LOGIN_FAILED',
    category: 'auth',
    details: `Failed login attempt for email: ${email}`,
    ipAddress: ip,
    userAgent,
    severity: 'warning',
  })
}

/** Log a user registration */
export async function auditRegister(
  userId: string,
  ip?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    actorId: userId,
    action: 'USER_REGISTERED',
    category: 'auth',
    details: 'New user registered',
    ipAddress: ip,
    userAgent,
    severity: 'info',
  })
}

/** Log a logout */
export async function auditLogout(
  userId: string,
  ip?: string
): Promise<void> {
  await createAuditLog({
    actorId: userId,
    action: 'LOGOUT',
    category: 'auth',
    details: 'User logged out',
    ipAddress: ip,
    severity: 'info',
  })
}

/** Log a subscription change */
export async function auditSubscriptionChange(
  userId: string,
  fromPlan: string,
  toPlan: string,
  actorId?: string,
  ip?: string
): Promise<void> {
  const isSelf = userId === actorId
  await createAuditLog({
    actorId: actorId || userId,
    action: 'SUBSCRIPTION_CHANGED',
    category: 'subscription',
    details: `Plan changed from "${fromPlan}" to "${toPlan}"${isSelf ? '' : ` (by admin)`}`,
    ipAddress: ip,
    severity: 'info',
  })
}

/** Log a subscription cancellation */
export async function auditSubscriptionCancel(
  userId: string,
  planName: string,
  actorId?: string,
  ip?: string
): Promise<void> {
  await createAuditLog({
    actorId: actorId || userId,
    action: 'SUBSCRIPTION_CANCELED',
    category: 'subscription',
    details: `Subscription "${planName}" canceled`,
    ipAddress: ip,
    severity: 'warning',
  })
}

/** Log a credit transaction */
export async function auditCreditTransaction(
  userId: string,
  amount: number,
  type: string,
  description: string,
  ip?: string
): Promise<void> {
  await createAuditLog({
    actorId: userId,
    action: 'CREDIT_TRANSACTION',
    category: 'credit',
    details: `${type}: ${amount > 0 ? '+' : ''}${amount} credits - ${description}`,
    ipAddress: ip,
    severity: amount < 0 ? 'info' : 'info',
  })
}

/** Log admin action on a user */
export async function auditAdminUserAction(
  adminId: string,
  action: string,
  targetUserId: string,
  details: string,
  ip?: string
): Promise<void> {
  await createAuditLog({
    actorId: adminId,
    action: `ADMIN_${action}`,
    category: 'admin',
    details: `Admin action on user ${targetUserId}: ${details}`,
    ipAddress: ip,
    severity: 'warning',
  })
}

/** Log a rate limit hit */
export async function auditRateLimitHit(
  ip: string,
  endpoint: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    actorId: null,
    action: 'RATE_LIMIT_EXCEEDED',
    category: 'security',
    details: `Rate limit exceeded on ${endpoint}`,
    ipAddress: ip,
    userAgent,
    severity: 'warning',
  })
}

/** Log a failed authorization attempt */
export async function auditUnauthorizedAccess(
  payload: JWTPayload | null,
  action: string,
  ip?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    actorId: payload?.sub || null,
    action: 'UNAUTHORIZED_ACCESS',
    category: 'security',
    details: `Unauthorized access attempt: ${action}. Role: ${payload?.role || 'anonymous'}`,
    ipAddress: ip,
    userAgent,
    severity: 'error',
  })
}

/** Log a password change */
export async function auditPasswordChange(
  userId: string,
  ip?: string
): Promise<void> {
  await createAuditLog({
    actorId: userId,
    action: 'PASSWORD_CHANGED',
    category: 'auth',
    details: 'Password changed successfully',
    ipAddress: ip,
    severity: 'info',
  })
}

/** Log a security event */
export async function auditSecurityEvent(
  action: string,
  details: string,
  severity: AuditSeverity = 'warning',
  actorId?: string,
  ip?: string
): Promise<void> {
  await createAuditLog({
    actorId,
    action,
    category: 'security',
    details,
    ipAddress: ip,
    severity,
  })
}

// ─── Helper to extract request info ────────────────────────────────────────

export function getRequestInfo(request: Request): { ip?: string; userAgent?: string } {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || undefined
  const userAgent = request.headers.get('user-agent') || undefined
  return { ip, userAgent }
}
