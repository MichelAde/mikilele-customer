'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: any | null
  role: string
  permissions: any
  loading: boolean
  signOut: () => Promise<void>
  hasPermission: (resource: string, action: string) => boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'user',
  permissions: {},
  loading: true,
  signOut: async () => {},
  hasPermission: () => false,
  isAdmin: false
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string>('user')
  const [permissions, setPermissions] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkUser()

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchUserRole(session.user.id)
        } else {
          setUser(null)
          setRole('user')
          setPermissions({})
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        await fetchUserRole(user.id)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchUserRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, permissions')
        .eq('user_id', userId)
        .single()

      if (data && !error) {
        setRole(data.role || 'user')
        setPermissions(data.permissions || {})
      } else {
        // If not in admin_users, they're a regular user
        setRole('user')
        setPermissions({})
      }
    } catch (error) {
      console.error('Error fetching role:', error)
      setRole('user')
      setPermissions({})
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setRole('user')
    setPermissions({})
    router.push('/')
  }

  const checkPermission = (resource: string, action: string) => {
    // Super admin has all permissions
    if (role === 'super_admin') return true
    
    // Check specific permissions
    if (permissions.all) return true
    if (permissions[resource]) return true
    
    return false
  }

  const isAdmin = ['super_admin', 'admin'].includes(role)

  return (
    <AuthContext.Provider 
      value={{
        user,
        role,
        permissions,
        loading,
        signOut,
        hasPermission: checkPermission,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)