'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { ArrowLeft, BookOpen, Calendar, Award } from 'lucide-react'

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchEnrollments()
  }, [])

  async function fetchEnrollments() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    const { data } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses (
          id,
          title,
          description,
          level,
          duration_weeks,
          instructor,
          schedule
        )
      `)
      .eq('user_id', user.id)
      .order('enrolled_at', { ascending: false })

    setEnrollments(data || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">My Courses</h1>

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">Browse our course catalog to get started</p>
            <Link
              href="/courses"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg ${
                    enrollment.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <BookOpen className={`w-6 h-6 ${
                      enrollment.status === 'active' ? 'text-green-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    enrollment.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : enrollment.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {enrollment.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-2">
                  {enrollment.courses?.title}
                </h3>

                <span className="inline-block text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold mb-3">
                  {enrollment.courses?.level?.toUpperCase()}
                </span>

                {enrollment.courses?.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {enrollment.courses.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {enrollment.courses?.instructor && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Instructor: {enrollment.courses.instructor}</span>
                    </div>
                  )}
                  {enrollment.courses?.schedule && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{enrollment.courses.schedule}</span>
                    </div>
                  )}
                  {enrollment.courses?.duration_weeks && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="w-4 h-4" />
                      <span>{enrollment.courses.duration_weeks} weeks</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{enrollment.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Link
                    href={`/portal/courses/${enrollment.id}`}
                    className="flex-1 text-center py-2 px-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}