import { createBrowserClient } from '@supabase/ssr'

export type UserRole = 'super_admin' | 'admin' | 'course_admin' | 'event_admin' | 'instructor' | 'user'

export interface Permission {
  resource: string
  action: 'create' | 'read' | 'update' | 'delete'
}

// Role hierarchy - higher roles inherit permissions from lower roles
const roleHierarchy: Record<UserRole, number> = {
  super_admin: 5,
  admin: 4,
  course_admin: 3,
  event_admin: 3,
  instructor: 2,
  user: 1
}

// Default permissions for each role
const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'delete' }
  ],
  admin: [
    { resource: 'campaigns', action: 'create' },
    { resource: 'campaigns', action: 'read' },
    { resource: 'campaigns', action: 'update' },
    { resource: 'campaigns', action: 'delete' },
    { resource: 'events', action: 'create' },
    { resource: 'events', action: 'read' },
    { resource: 'events', action: 'update' },
    { resource: 'events', action: 'delete' },
    { resource: 'courses', action: 'create' },
    { resource: 'courses', action: 'read' },
    { resource: 'courses', action: 'update' },
    { resource: 'courses', action: 'delete' },
    { resource: 'enrollments', action: 'create' },
    { resource: 'enrollments', action: 'read' },
    { resource: 'enrollments', action: 'update' },
    { resource: 'enrollments', action: 'delete' }
  ],
  course_admin: [
    { resource: 'courses', action: 'create' },
    { resource: 'courses', action: 'read' },
    { resource: 'courses', action: 'update' },
    { resource: 'enrollments', action: 'create' },
    { resource: 'enrollments', action: 'read' },
    { resource: 'enrollments', action: 'update' },
    { resource: 'attendance', action: 'create' },
    { resource: 'attendance', action: 'read' },
    { resource: 'attendance', action: 'update' }
  ],
  event_admin: [
    { resource: 'events', action: 'create' },
    { resource: 'events', action: 'read' },
    { resource: 'events', action: 'update' },
    { resource: 'tickets', action: 'create' },
    { resource: 'tickets', action: 'read' },
    { resource: 'tickets', action: 'update' },
    { resource: 'passes', action: 'create' },
    { resource: 'passes', action: 'read' },
    { resource: 'passes', action: 'update' }
  ],
  instructor: [
    { resource: 'courses', action: 'read' },
    { resource: 'enrollments', action: 'read' },
    { resource: 'attendance', action: 'create' },
    { resource: 'attendance', action: 'read' },
    { resource: 'attendance', action: 'update' }
  ],
  user: [
    { resource: 'portal', action: 'read' }
  ]
}

// Get user role and permissions
export async function getUserRole(userId: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('admin_users')
    .select('role, permissions')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return { role: 'user' as UserRole, permissions: {} }
  }

  return {
    role: data.role as UserRole,
    permissions: data.permissions || {}
  }
}

// Check if user has permission
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  // Super admin has all permissions
  if (userRole === 'super_admin') {
    return true
  }

  const permissions = rolePermissions[userRole] || []
  
  // Check exact match or wildcard
  return permissions.some(
    p => (p.resource === resource || p.resource === '*') && p.action === action
  )
}

// Check if user has higher or equal role
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Log activity
export async function logActivity(
  userId: string,
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: any
) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details
    })
}