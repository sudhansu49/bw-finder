// ─── RBAC: Role-Based Access Control System ──────────────────────────────────
// Role hierarchy: SUPER_ADMIN > ADMIN > AGENCY_OWNER > TEAM_MEMBER > USER

export type Role = 'super_admin' | 'admin' | 'agency_owner' | 'team_member' | 'user'

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 100,
  admin: 80,
  agency_owner: 60,
  team_member: 40,
  user: 20,
}

// ─── Permission Definitions ──────────────────────────────────────────────────

export type Permission =
  // User management
  | 'users.list' | 'users.view' | 'users.create' | 'users.update' | 'users.delete' | 'users.impersonate'
  // Agency management
  | 'agencies.list' | 'agencies.view' | 'agencies.create' | 'agencies.update' | 'agencies.delete'
  // Subscription management
  | 'subscriptions.list' | 'subscriptions.view' | 'subscriptions.create' | 'subscriptions.update' | 'subscriptions.cancel'
  // Billing
  | 'billing.view' | 'billing.manage' | 'transactions.list' | 'transactions.view'
  // Credits
  | 'credits.list' | 'credits.view' | 'credits.add' | 'credits.deduct' | 'credits.manage'
  // Leads
  | 'leads.list' | 'leads.view' | 'leads.create' | 'leads.update' | 'leads.delete' | 'leads.export'
  // CRM
  | 'crm.view' | 'crm.manage'
  // Categories & Locations
  | 'categories.list' | 'categories.manage' | 'locations.list' | 'locations.manage'
  // API & System
  | 'api.usage' | 'api.manage' | 'system.health' | 'system.settings'
  // Audit & Reports
  | 'audit.view' | 'reports.view' | 'reports.create' | 'reports.export'
  // Support
  | 'support.tickets' | 'support.manage'
  // Marketing & Broadcasts
  | 'announcements.manage' | 'broadcast.email' | 'broadcast.whatsapp' | 'marketing.manage'
  // Integrations & AI
  | 'integrations.manage' | 'ai.usage' | 'feature_flags.manage'
  // Own profile
  | 'profile.view' | 'profile.update' | 'billing.own' | 'notifications.own' | 'settings.own'

// ─── Role-Permission Matrix ──────────────────────────────────────────────────

const SUPER_ADMIN_PERMISSIONS: Permission[] = [
  'users.list', 'users.view', 'users.create', 'users.update', 'users.delete', 'users.impersonate',
  'agencies.list', 'agencies.view', 'agencies.create', 'agencies.update', 'agencies.delete',
  'subscriptions.list', 'subscriptions.view', 'subscriptions.create', 'subscriptions.update', 'subscriptions.cancel',
  'billing.view', 'billing.manage', 'transactions.list', 'transactions.view',
  'credits.list', 'credits.view', 'credits.add', 'credits.deduct', 'credits.manage',
  'leads.list', 'leads.view', 'leads.create', 'leads.update', 'leads.delete', 'leads.export',
  'crm.view', 'crm.manage',
  'categories.list', 'categories.manage', 'locations.list', 'locations.manage',
  'api.usage', 'api.manage', 'system.health', 'system.settings',
  'audit.view', 'reports.view', 'reports.create', 'reports.export',
  'support.tickets', 'support.manage',
  'announcements.manage', 'broadcast.email', 'broadcast.whatsapp', 'marketing.manage',
  'integrations.manage', 'ai.usage', 'feature_flags.manage',
  'profile.view', 'profile.update', 'billing.own', 'notifications.own', 'settings.own',
]

const ADMIN_PERMISSIONS: Permission[] = [
  'users.list', 'users.view', 'users.create', 'users.update', 'users.delete',
  'agencies.list', 'agencies.view',
  'subscriptions.list', 'subscriptions.view', 'subscriptions.create', 'subscriptions.update', 'subscriptions.cancel',
  'billing.view', 'transactions.list', 'transactions.view',
  'credits.list', 'credits.view', 'credits.add', 'credits.deduct', 'credits.manage',
  'leads.list', 'leads.view', 'leads.create', 'leads.update', 'leads.delete', 'leads.export',
  'crm.view', 'crm.manage',
  'categories.list', 'categories.manage', 'locations.list', 'locations.manage',
  'api.usage', 'system.health',
  'audit.view', 'reports.view', 'reports.create', 'reports.export',
  'support.tickets', 'support.manage',
  'announcements.manage', 'broadcast.email', 'broadcast.whatsapp',
  'ai.usage',
  'profile.view', 'profile.update', 'billing.own', 'notifications.own', 'settings.own',
]

const AGENCY_OWNER_PERMISSIONS: Permission[] = [
  'users.list', 'users.view', 'users.create', 'users.update',
  'agencies.view', 'agencies.update',
  'subscriptions.view', 'subscriptions.create',
  'billing.view', 'billing.own',
  'credits.list', 'credits.view',
  'leads.list', 'leads.view', 'leads.create', 'leads.update', 'leads.export',
  'crm.view', 'crm.manage',
  'categories.list', 'locations.list',
  'reports.view', 'reports.create', 'reports.export',
  'support.tickets',
  'profile.view', 'profile.update', 'billing.own', 'notifications.own', 'settings.own',
]

const TEAM_MEMBER_PERMISSIONS: Permission[] = [
  'leads.list', 'leads.view', 'leads.create', 'leads.update', 'leads.export',
  'crm.view',
  'categories.list', 'locations.list',
  'reports.view',
  'support.tickets',
  'profile.view', 'profile.update', 'notifications.own', 'settings.own',
]

const USER_PERMISSIONS: Permission[] = [
  'leads.list', 'leads.view', 'leads.create', 'leads.update', 'leads.export',
  'crm.view',
  'reports.view',
  'support.tickets',
  'profile.view', 'profile.update', 'billing.own', 'notifications.own', 'settings.own',
]

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: SUPER_ADMIN_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  agency_owner: AGENCY_OWNER_PERMISSIONS,
  team_member: TEAM_MEMBER_PERMISSIONS,
  user: USER_PERMISSIONS,
}

// ─── Helper Functions ────────────────────────────────────────────────────────

export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role as Role]
  if (!permissions) return false
  return permissions.includes(permission)
}

export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p))
}

export function isAdminRole(role: string): boolean {
  return ['super_admin', 'admin'].includes(role)
}

export function canAccessAdminPanel(role: string): boolean {
  return ['super_admin', 'admin'].includes(role)
}

export function getRoleLevel(role: string): number {
  return ROLE_HIERARCHY[role as Role] || 0
}

export function canManageRole(actorRole: string, targetRole: string): boolean {
  return getRoleLevel(actorRole) > getRoleLevel(targetRole)
}

// ─── Route Protection for API ────────────────────────────────────────────────

export function requirePermission(role: string, permission: Permission): { allowed: boolean; error?: string } {
  if (!role) return { allowed: false, error: 'Authentication required' }
  if (hasPermission(role, permission)) return { allowed: true }
  return { allowed: false, error: 'Insufficient permissions' }
}

export function requireAdminAccess(role: string): { allowed: boolean; error?: string } {
  if (!role) return { allowed: false, error: 'Authentication required' }
  if (canAccessAdminPanel(role)) return { allowed: true }
  return { allowed: false, error: 'Admin access required' }
}

// ─── Admin Sidebar Items with Required Permissions ───────────────────────────

export const ADMIN_NAV_PERMISSIONS: Record<string, Permission[]> = {
  dashboard: ['users.list'],
  users: ['users.list'],
  agencies: ['agencies.list'],
  subscriptions: ['subscriptions.list'],
  payments: ['transactions.list'],
  transactions: ['transactions.list'],
  leads: ['leads.list'],
  categories: ['categories.list'],
  locations: ['locations.list'],
  credits: ['credits.list'],
  'api-usage': ['api.usage'],
  'system-health': ['system.health'],
  'audit-logs': ['audit.view'],
  reports: ['reports.view'],
  support: ['support.tickets'],
  announcements: ['announcements.manage'],
  'email-broadcast': ['broadcast.email'],
  'whatsapp-broadcast': ['broadcast.whatsapp'],
  marketing: ['marketing.manage'],
  integrations: ['integrations.manage'],
  'ai-usage': ['ai.usage'],
  'feature-flags': ['feature_flags.manage'],
  settings: ['system.settings'],
}
