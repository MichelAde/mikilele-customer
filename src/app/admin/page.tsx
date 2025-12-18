'use client'

import Link from 'next/link'
import { DollarSign } from 'lucide-react'
import { Ticket } from 'lucide-react'
import { CreditCard } from 'lucide-react'
import { BookOpen } from 'lucide-react'
import { Users } from 'lucide-react'
import { CheckCircle } from 'lucide-react'
import { CalendarPlus, Share2, Library, Calendar as CalendarIcon, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your events and marketing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Event Card */}
          <Link
            href="/admin/create-event"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-lg">
                <CalendarPlus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Create Event</h2>
                <p className="text-gray-600">Add new events</p>
              </div>
            </div>
          </Link>
          {/* Ticket Types Management - NEW! */}
          <Link
            href="/admin/events/ticket-types"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-4 rounded-lg">
                <Ticket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Ticket Types</h2>
                <p className="text-gray-600">Manage ticket pricing</p>
              </div>
            </div>
          </Link>
          {/* Social Media - Create Post */}
          <Link
            href="/admin/social/create"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-lg">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Create Social Post</h2>
                <p className="text-gray-600">Schedule social media</p>
              </div>
            </div>
          </Link>

          {/* Posts Library */}
          <Link
            href="/admin/social/posts"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-green-500 to-teal-500 p-4 rounded-lg">
                <Library className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Posts Library</h2>
                <p className="text-gray-600">Manage scheduled posts</p>
              </div>
            </div>
          </Link>

          {/* Content Calendar */}
          <Link
            href="/admin/social/calendar"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-lg">
                <CalendarIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Content Calendar</h2>
                <p className="text-gray-600">View posting schedule</p>
              </div>
            </div>
          </Link>
          {/* Sales Dashboard - NEW! */}
          <Link
            href="/admin/events/sales"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Sales Dashboard</h2>
                <p className="text-gray-600">Track revenue & sales</p>
              </div>
            </div>
          </Link>
          {/* Pass Management - NEW! */}
          <Link
            href="/admin/passes/manage"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-4 rounded-lg">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Pass Management</h2>
                <p className="text-gray-600">Manage multi-event passes</p>
              </div>
            </div>
          </Link>
          {/* Enrollment Management - NEW! */}
          <Link
            href="/admin/school/enrollments"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-4 rounded-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Enrollments</h2>
                <p className="text-gray-600">Manage student enrollments</p>
              </div>
            </div>
          </Link>
          {/* Course Management - NEW! */}
          <Link
            href="/admin/school/courses"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Course Management</h2>
                <p className="text-gray-600">AI-powered curriculum</p>
              </div>
            </div>
          </Link>
          {/* Attendance & Progress - NEW! */}
          <Link
            href="/admin/school/attendance"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-4 rounded-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Attendance</h2>
                <p className="text-gray-600">Track student progress</p>
              </div>
            </div>
          </Link>
          {/* Marketing Campaigns - NEW! */}
          <Link
            href="/admin/campaigns"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Marketing Campaigns</h2>
                <p className="text-gray-600">Multi-channel automation</p>
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
  )
}