'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/lib/rbac'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredPermission?: {
    resource: string
    action: 'create' | 'read' | 'update' | 'delete'
  }
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const { user, role, hasPermission, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Check if user is authenticated
      if (!user) {
        router.push(redirectTo)
        return
      }

      // Check role requirement
      if (requiredRole) {
        const roleHierarchy: Record<UserRole, number> = {
          super_admin: 5,
          admin: 4,
          course_admin: 3,
          event_admin: 3,
          instructor: 2,
          user: 1
        }

        if (roleHierarchy[role] < roleHierarchy[requiredRole]) {
          router.push('/unauthorized')
          return
        }
      }

      // Check permission requirement
      if (requiredPermission) {
        if (!hasPermission(requiredPermission.resource, requiredPermission.action)) {
          router.push('/unauthorized')
          return
        }
      }
    }
  }, [user, role, loading, requiredRole, requiredPermission])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}