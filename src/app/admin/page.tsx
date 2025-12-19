'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { 
  BarChart3, 
  Calendar, 
  CreditCard, 
  Mail, 
  Users, 
  BookOpen,
  Ticket,
  CheckCircle,
  CalendarPlus,
  Share2,
  Library,
  TrendingUp,
  DollarSign
} from 'lucide-react'

export default function AdminDashboard() {
  const { user, role } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  
  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  async function fetchEvents() {
    try {
      const response = await fetch('/api/events')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setEvents(data.events || [])
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setEventsLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.email} • <span className="capitalize font-semibold text-purple-600">{role}</span>
            </p>
            {!eventsLoading && (
              <p className="text-sm text-gray-500 mt-1">
                {events.length} active events
              </p>
            )}
          </div>

          {/* Admin Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Create Event */}
            <Link
              href="/admin/create-event"
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 hover:border-purple-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-lg">
                  <CalendarPlus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Create Event</h2>
                  <p className="text-gray-600 text-sm">Add new events</p>
                </div>
              </div>
            </Link>

            {/* Marketing Campaigns */}
            <Link
              href="/admin/campaigns"
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 hover:border-purple-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-lg">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Marketing Campaigns</h2>
                  <p className="text-gray-600 text-sm">Email & SMS automation</p>
                </div>
              </div>
            </Link>

            {/* Campaign Analytics */}
            <Link
              href="/admin/campaigns/analytics"
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 hover:border-purple-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-green-500 to-teal-500 p-4 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Campaign Analytics</h2>
                  <p className="text-gray-600 text-sm">Performance insights</p>
                </div>
              </div>
            </Link>

            {/* Sales Dashboard */}
            <Link
              href="/admin/events/sales"
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 hover:border-purple-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-lg">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Sales Dashboard</h2>
                  <p className="text-gray-600 text-sm">Revenue & analytics</p>
                </div>
              </div>
            </Link>

            {/* Ticket Types */}
            <Link
              href="/admin/events/ticket-types"
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 hover:border-purple-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-lg">
                  <Ticket className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Ticket Management</h2>
                  <p className="text-gray-600 text-sm">Manage ticket types</p>
                </div>
              </div>
            </Link>

            {/* Pass Management */}
            <Link
              href="/admin/passes/manage"
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 hover:border-purple-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-4 rounded-lg">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Pass Management</h2>
                  <p className="text-gray-600 text-sm">Multi-event passes</p>
                </div>
              </div>
            </Link>

            {/* Social Media - Create Post */}
            <Link
              href="/admin/social/create"
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 hover:border-purple-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-lg">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Create Social Post</h2>
                  <p className="text-gray-600 text-sm">Schedule social media</p>
                </div>
              </div>
            </Link>

            {/* Posts Library */}
            <Link
              href="/admin/social/posts"
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 hover:border-purple-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-green-500 to-teal-500 p-4 rounded-lg">
                  <Library className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Posts Library</h2>
                  <p className="text-gray-600 text-sm">Manage scheduled posts</p>
                </div>
              </div>
            </Link>

            {/* Content Calendar */}
            <Link
              href="/admin/social/calendar"
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 hover:border-purple-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Content Calendar</h2>
                  <p className="text-gray-600 text-sm">View posting schedule</p>
                </div>
              </div>
            </Link>

            {/* Course Management */}
            <Link
              href="/admin/school/courses"
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 hover:border-purple-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-4 rounded-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Course Management</h2>
                  <p className="text-gray-600 text-sm">AI-powered courses</p>
                </div>
              </div>
            </Link>

            {/* Enrollment Management */}
            <Link
              href="/admin/school/enrollments"
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 hover:border-purple-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-4 rounded-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Enrollments</h2>
                  <p className="text-gray-600 text-sm">Student enrollments</p>
                </div>
              </div>
            </Link>

            {/* Attendance & Progress */}
            <Link
              href="/admin/school/attendance"
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 hover:border-purple-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-4 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Attendance</h2>
                  <p className="text-gray-600 text-sm">Track student progress</p>
                </div>
              </div>
            </Link>

          </div>

          {/* Back to Home */}
          <div className="mt-8">
            <Link
              href="/"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}