'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { User, Ticket, CreditCard, GraduationCap, Settings, LogOut, Home } from 'lucide-react'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      router.push('/auth/login?redirect=/portal')
      return
    }
    
    setUser(user)
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Back to Home</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow sticky top-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-semibold text-lg">My Account</h2>
              </div>

              <nav className="p-4 space-y-1">
                <Link
                  href="/portal"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive('/portal')
                      ? 'bg-purple-50 text-purple-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Overview</span>
                </Link>

                <Link
                  href="/portal/tickets"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive('/portal/tickets')
                      ? 'bg-purple-50 text-purple-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Ticket className="w-5 h-5" />
                  <span>My Tickets</span>
                </Link>

                <Link
                  href="/portal/passes"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive('/portal/passes')
                      ? 'bg-purple-50 text-purple-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>My Passes</span>
                </Link>

                <Link
                  href="/portal/classes"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive('/portal/classes')
                      ? 'bg-purple-50 text-purple-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>My Classes</span>
                </Link>

                <Link
                  href="/portal/settings"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive('/portal/settings')
                      ? 'bg-purple-50 text-purple-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}