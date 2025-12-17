'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  DollarSign, 
  Ticket, 
  CreditCard, 
  TrendingUp,
  Calendar,
  Users,
  RefreshCw
} from 'lucide-react'

interface OverviewMetrics {
  totalRevenue: number
  totalTicketsSold: number
  totalPassesSold: number
  totalOrders: number
  averageOrderValue: number
}

interface RevenueByDay {
  date: string
  revenue: number
}

interface TopEvent {
  eventId: string
  title: string
  count: number
}

interface RecentOrder {
  id: string
  amount: number
  status: string
  created_at: string
  user_id: string
}

export default function SalesDashboard() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')
  const [overview, setOverview] = useState<OverviewMetrics | null>(null)
  const [revenueByDay, setRevenueByDay] = useState<RevenueByDay[]>([])
  const [topEvents, setTopEvents] = useState<TopEvent[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      const response = await fetch(`/api/events/sales-analytics?timeRange=${timeRange}`)
      const data = await response.json()

      if (data.success) {
        setOverview(data.overview)
        setRevenueByDay(data.revenueByDay)
        setTopEvents(data.topEvents)
        setRecentOrders(data.recentOrders)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sales data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sales Dashboard</h1>
            <p className="text-gray-600">Track your event revenue and performance</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border rounded-lg px-4 py-2 bg-white"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm opacity-90">Total Revenue</div>
              <DollarSign className="w-5 h-5 opacity-80" />
            </div>
            <div className="text-3xl font-bold">
              ${overview?.totalRevenue.toLocaleString() || 0}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Tickets Sold</div>
              <Ticket className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold">{overview?.totalTicketsSold || 0}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Passes Sold</div>
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold">{overview?.totalPassesSold || 0}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Total Orders</div>
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold">{overview?.totalOrders || 0}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Avg Order Value</div>
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold">
              ${overview?.averageOrderValue.toFixed(2) || 0}
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
          <div className="h-64 flex items-end gap-2">
            {revenueByDay.map((day, index) => {
              const maxRevenue = Math.max(...revenueByDay.map(d => d.revenue))
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg hover:from-purple-700 hover:to-purple-500 transition cursor-pointer relative group"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                      ${day.revenue.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 transform -rotate-45 origin-top-left mt-2">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Events */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Top Selling Events</h2>
            </div>
            <div className="p-6">
              {topEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No sales data available yet
                </div>
              ) : (
                <div className="space-y-4">
                  {topEvents.map((event, index) => (
                    <div key={event.eventId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{event.title}</div>
                          <div className="text-sm text-gray-500">{event.count} tickets sold</div>
                        </div>
                      </div>
                      <Link
                        href={`/admin/events/sales?eventId=${event.eventId}`}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No recent orders
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div>
                        <div className="font-semibold">${order.amount.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleString()}
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}