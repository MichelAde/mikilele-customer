'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  level: string
  duration_weeks: number | null
  max_students: number | null
  price: number | null
  schedule: string | null
  instructor: string | null
  curriculum: string | null
  is_active: boolean
  created_at: string
  total_enrolled?: number
}

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    setLoading(true)
    try {
      const response = await fetch('/api/courses/manage')
      const data = await response.json()

      if (data.success) {
        setCourses(data.courses)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteCourse(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    try {
      const response = await fetch(`/api/courses/manage?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        alert('Course deleted successfully!')
        fetchCourses()
      } else {
        alert(data.error || 'Failed to delete course')
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Failed to delete course')
    }
  }

  async function toggleActive(course: Course) {
    try {
      const response = await fetch('/api/courses/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: course.id,
          is_active: !course.is_active
        })
      })

      const data = await response.json()

      if (data.success) {
        fetchCourses()
      }
    } catch (error) {
      console.error('Error toggling active status:', error)
    }
  }

  const levelColors: { [key: string]: string } = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
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
            <h1 className="text-3xl font-bold mb-2">Course Management</h1>
            <p className="text-gray-600">Create and manage dance courses with AI-powered curriculum</p>
          </div>
          <Link
            href="/admin/school/courses/create"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Course
          </Link>
        </div>

        {/* Courses List */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <BookOpen className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first course with AI-generated curriculum
            </p>
            <Link
              href="/admin/school/courses/create"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const percentageFilled = course.max_students && course.total_enrolled
                ? (course.total_enrolled / course.max_students) * 100
                : 0

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      course.is_active ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <BookOpen className={`w-6 h-6 ${
                        course.is_active ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    {course.is_active ? (
                      <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-800 font-semibold flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        INACTIVE
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                  
                  <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold mb-3 ${
                    levelColors[course.level] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.level.toUpperCase()}
                  </span>

                  {course.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  )}

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500">Enrolled</div>
                        <div className="font-semibold">
                          {course.total_enrolled || 0}
                          {course.max_students && ` / ${course.max_students}`}
                        </div>
                      </div>
                    </div>

                    {course.duration_weeks && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <div>
                          <div className="text-xs text-gray-500">Duration</div>
                          <div className="font-semibold">{course.duration_weeks} weeks</div>
                        </div>
                      </div>
                    )}

                    {course.price && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="text-xs text-gray-500">Price</div>
                          <div className="font-semibold">${course.price}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enrollment Progress */}
                  {course.max_students && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Enrollment</span>
                        <span>{percentageFilled.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentageFilled}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Schedule & Instructor */}
                  {(course.schedule || course.instructor) && (
                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                      {course.schedule && <div>📅 {course.schedule}</div>}
                      {course.instructor && <div>👨‍🏫 {course.instructor}</div>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => toggleActive(course)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition ${
                        course.is_active 
                          ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' 
                          : 'bg-green-100 hover:bg-green-200 text-green-700'
                      }`}
                    >
                      {course.is_active ? 'Deactivate' : 'Activate'}
                    </button>

                    <Link
                      href={`/admin/school/courses/${course.id}`}
                      className="py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium text-sm transition"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <Link
                      href={`/admin/school/courses/${course.id}/edit`}
                      className="py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => deleteCourse(course.id, course.title)}
                      className="py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium text-sm transition"
                      disabled={(course.total_enrolled || 0) > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}