'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Ticket, CreditCard, GraduationCap, Calendar, TrendingUp } from 'lucide-react'

export default function PortalOverview() {
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    activePasses: 0,
    activeEnrollments: 0,
    totalSpent: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch upcoming tickets
      const { data: orders } = await supabase
        .from('orders')
        .select('*, order_items(*, events(title, start_datetime))')
        .eq('user_id', user.id)
        .eq('status', 'completed')

      // Count upcoming events
      const now = new Date().toISOString()
      let upcomingCount = 0
      let totalSpent = 0

      if (orders) {
        orders.forEach(order => {
          totalSpent += parseFloat(order.total_amount || 0)
          order.order_items?.forEach((item: any) => {
            if (item.events?.start_datetime > now) {
              upcomingCount++
            }
          })
        })
      }

      // Fetch active passes
      const { data: passes } = await supabase
        .from('user_passes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)

      // Fetch active enrollments
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')

      setStats({
        upcomingEvents: upcomingCount,
        activePasses: passes?.length || 0,
        activeEnrollments: enrollments?.length || 0,
        totalSpent: totalSpent
      })

      // Recent activity (last 5 orders)
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('*, order_items(*, events(title))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentActivity(recentOrders || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Welcome Back!</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-blue-600">{stats.upcomingEvents}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
          <p className="text-sm text-gray-600">Events you're attending</p>
          <Link href="/portal/tickets" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            View tickets →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="w-8 h-8 text-purple-600" />
            <span className="text-3xl font-bold text-purple-600">{stats.activePasses}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Active Passes</h3>
          <p className="text-sm text-gray-600">Multi-event passes</p>
          <Link href="/portal/passes" className="text-sm text-purple-600 hover:underline mt-2 inline-block">
            View passes →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <GraduationCap className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-green-600">{stats.activeEnrollments}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Active Classes</h3>
          <p className="text-sm text-gray-600">Current enrollments</p>
          <Link href="/portal/classes" className="text-sm text-green-600 hover:underline mt-2 inline-block">
            View classes →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <span className="text-3xl font-bold text-orange-600">${stats.totalSpent.toFixed(0)}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Total Spent</h3>
          <p className="text-sm text-gray-600">Lifetime purchases</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Recent Activity</h2>
        </div>
        
        {recentActivity.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No purchases yet</h3>
            <p className="text-gray-600 mb-6">Start by browsing our events and classes</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/events"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Browse Events
              </Link>
              <Link
                href="/classes"
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                View Classes
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentActivity.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Ticket className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold">Order #{order.id.slice(0, 8)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {order.order_items?.map((item: any, idx: number) => (
                        <div key={idx}>
                          • {item.events?.title || 'Unknown Event'}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${order.total_amount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}