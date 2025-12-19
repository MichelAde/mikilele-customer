'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { GraduationCap, Calendar, User, TrendingUp, Clock } from 'lucide-react'

interface Enrollment {
  id: string
  course_id: string
  status: string
  progress: number
  enrollment_date: string
  completion_date: string | null
  courses: {
    title: string
    instructor: string
    start_date: string
    duration_weeks: number
    level: string
  }
}

export default function MyClassesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchEnrollments()
  }, [])

  async function fetchEnrollments() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            title,
            instructor,
            start_date,
            duration_weeks,
            level,
            organization (name)
          )
        `)
        .eq('user_id', user.id)
        .order('enrollment_date', { ascending: false })

      if (error) {
        console.error('Error fetching enrollments:', error)
      } else {
        setEnrollments(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  function getStatusBadge(status: string) {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
    }
    
    const badge = badges[status as keyof typeof badges] || badges.active
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const activeEnrollments = enrollments.filter(e => e.status === 'active')
  const completedEnrollments = enrollments.filter(e => e.status === 'completed')
  const displayEnrollments = activeTab === 'active' ? activeEnrollments : completedEnrollments

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Classes</h1>
        <p className="text-gray-600">Track your course progress and enrollments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === 'active'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active ({activeEnrollments.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === 'completed'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed ({completedEnrollments.length})
        </button>
      </div>

      {/* Enrollments List */}
      {displayEnrollments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeTab === 'active' ? 'No active classes' : 'No completed classes'}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'active' 
              ? 'Start learning with our dance classes'
              : 'Your completed classes will appear here'}
          </p>
          {activeTab === 'active' && (
            <Link
              href="/classes"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Browse Classes
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayEnrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {enrollment.courses.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                    </p>
                  </div>
                  {getStatusBadge(enrollment.status)}
                </div>

                {/* Course Details */}
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <User className="w-5 h-5" />
                    <div>
                      <p className="text-xs text-gray-500">Instructor</p>
                      <p className="font-medium">{enrollment.courses.instructor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="font-medium">{formatDate(enrollment.courses.start_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-medium">{enrollment.courses.duration_weeks} weeks</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar (for active courses) */}
                {enrollment.status === 'active' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Progress
                      </span>
                      <span className="font-semibold">{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Completion Date (for completed courses) */}
                {enrollment.status === 'completed' && enrollment.completion_date && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ✓ Completed on {formatDate(enrollment.completion_date)}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {enrollment.status === 'active' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-medium">
                      View Course Materials
                    </button>
                    <button className="px-4 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition font-medium">
                      Mark Attendance
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      {displayEnrollments.length > 0 && activeTab === 'active' && (
        <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Continue Learning</h3>
          <p className="mb-4 opacity-90">Explore more courses to enhance your skills</p>
          <Link
            href="/classes"
            className="inline-block bg-white text-purple-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Browse All Classes
          </Link>
        </div>
      )}
    </div>
  )
}