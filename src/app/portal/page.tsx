'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Calendar, 
  CreditCard, 
  BookOpen, 
  Ticket,
  User,
  LogOut,
  TrendingUp
} from 'lucide-react'

interface UserData {
  enrollments: any[]
  tickets: any[]
  passes: any[]
  orders: any[]
}

export default function CustomerPortal() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<UserData>({
    enrollments: [],
    tickets: [],
    passes: [],
    orders: []
  })
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUser(user)
      await fetchUserData(user.id)
    } else {
      window.location.href = '/auth/login'
    }
  }

  async function fetchUserData(userId: string) {
    setLoading(true)
    try {
      // Fetch enrollments
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            title,
            instructor,
            level,
            duration_weeks
          )
        `)
        .eq('user_id', userId)
        .order('enrolled_at', { ascending: false })

      // Fetch tickets
      const { data: tickets } = await supabase
        .from('tickets')
        .select(`
          *,
          events (
            name,
            date,
            location
          )
        `)
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false })

      // Fetch passes
      const { data: passes } = await supabase
        .from('user_passes')
        .select(`
          *,
          passes (
            name,
            type,
            price
          )
        `)
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false })

      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      setUserData({
        enrollments: enrollments || [],
        tickets: tickets || [],
        passes: passes || [],
        orders: orders || []
      })
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">My Portal</h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{userData.enrollments.length}</div>
                <div className="text-sm text-gray-600">Active Courses</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Ticket className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{userData.tickets.length}</div>
                <div className="text-sm text-gray-600">Event Tickets</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{userData.passes.length}</div>
                <div className="text-sm text-gray-600">Active Passes</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {userData.enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / 
                   (userData.enrollments.length || 1)}%
                </div>
                <div className="text-sm text-gray-600">Avg Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/portal/courses"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">My Courses</h3>
            <p className="text-gray-600">View enrolled courses and track progress</p>
          </Link>

          <Link
            href="/portal/tickets"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <Ticket className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">My Tickets</h3>
            <p className="text-gray-600">View upcoming events and tickets</p>
          </Link>

          <Link
            href="/portal/passes"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <CreditCard className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">My Passes</h3>
            <p className="text-gray-600">Manage your active passes</p>
          </Link>
        </div>

        {/* My Courses */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">My Courses</h2>
          </div>
          <div className="p-6">
            {userData.enrollments.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No courses enrolled yet</p>
            ) : (
              <div className="space-y-4">
                {userData.enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="border rounded-lg p-4 hover:border-purple-300 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {enrollment.courses?.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {enrollment.courses?.instructor} • {enrollment.courses?.level}
                        </p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        enrollment.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {enrollment.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link
                        href={`/portal/courses/${enrollment.id}`}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Recent Orders</h2>
          </div>
          <div className="p-6">
            {userData.orders.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {userData.orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center border-b pb-3"
                  >
                    <div>
                      <div className="font-medium">Order #{order.id.slice(0, 8)}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${order.total_amount}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}