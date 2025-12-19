'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
  requiredPermission?: any
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      // Get current user
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        console.log('No authenticated user, redirecting to login')
        router.push(redirectTo)
        return
      }

      setUser(user)
      setAuthorized(true)
      setLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push(redirectTo)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return <>{children}</>
}