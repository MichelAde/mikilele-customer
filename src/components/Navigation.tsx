'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { User, Menu, X, Home, Calendar, GraduationCap, CreditCard, Settings as SettingsIcon, LogOut, Ticket } from 'lucide-react'

export default function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  )

  useEffect(() => {
    checkUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  // Don't show navigation on portal pages (they have their own nav)
  if (pathname?.startsWith('/portal') || pathname?.startsWith('/admin')) {
    return null
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl">Mikilele Events</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/events"
              className={`text-sm font-medium transition ${
                isActive('/events')
                  ? 'text-purple-600'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              Events
            </Link>
            <Link
              href="/classes"
              className={`text-sm font-medium transition ${
                isActive('/classes')
                  ? 'text-purple-600'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              Classes
            </Link>
            <Link
              href="/passes"
              className={`text-sm font-medium transition ${
                isActive('/passes')
                  ? 'text-purple-600'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              Passes
            </Link>

            {/* User Menu or Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">My Account</span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">Signed in as</p>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      </div>
                      
                      <Link
                        href="/portal"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Home className="w-4 h-4" />
                        Dashboard
                      </Link>
                      
                      <Link
                        href="/portal/tickets"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Ticket className="w-4 h-4" />
                        My Tickets
                      </Link>
                      
                      <Link
                        href="/portal/passes"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <CreditCard className="w-4 h-4" />
                        My Passes
                      </Link>
                      
                      <Link
                        href="/portal/classes"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <GraduationCap className="w-4 h-4" />
                        My Classes
                      </Link>
                      
                      <Link
                        href="/portal/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <SettingsIcon className="w-4 h-4" />
                        Settings
                      </Link>
                      
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-700 hover:text-purple-600 transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col gap-2">
              <Link
                href="/events"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                href="/classes"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Classes
              </Link>
              <Link
                href="/passes"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Passes
              </Link>

              {user ? (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    href="/portal"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 rounded-lg text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}