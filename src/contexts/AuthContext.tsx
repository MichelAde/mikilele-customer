'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { getUserRole, hasPermission, UserRole } from '@/lib/rbac'

interface AuthContextType {
  user: any | null
  role: UserRole
  permissions: any
  loading: boolean
  signOut: () => Promise<void>
  hasPermission: (resource: string, action: 'create' | 'read' | 'update' | 'delete') => boolean
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
  const [role, setRole] = useState<UserRole>('user')
  const [permissions, setPermissions] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          const roleData = await getUserRole(session.user.id)
          setRole(roleData.role)
          setPermissions(roleData.permissions)
        } else {
          setUser(null)
          setRole('user')
          setPermissions({})
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUser(user)
      const roleData = await getUserRole(user.id)
      setRole(roleData.role)
      setPermissions(roleData.permissions)
    }
    
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setRole('user')
    setPermissions({})
    router.push('/')
  }

  const checkPermission = (resource: string, action: 'create' | 'read' | 'update' | 'delete') => {
    return hasPermission(role, resource, action)
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