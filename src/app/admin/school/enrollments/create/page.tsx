'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Users } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface Course {
  id: string
  title: string
  level: string
  price: number
  max_students: number
}

interface User {
  id: string
  email: string
}

export default function CreateEnrollment() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [users, setUsers] = useState<User[]>([])
  
  const [formData, setFormData] = useState({
    course_id: '',
    user_id: '',
    payment_status: 'pending',
    payment_amount: '',
    notes: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchCourses()
    fetchUsers()
  }, [])

  async function fetchCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, level, price, max_students')
        .eq('is_active', true)
        .order('title')

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  async function fetchUsers() {
    try {
      const response = await fetch('/api/users/list')
      const data = await response.json()
  
      if (data.success) {
        setUsers(data.users)
      } else {
        console.error('Error fetching users:', data.error)
        setUsers([])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.course_id || !formData.user_id) {
      alert('Please select a course and student')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/enrollments/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        alert('Student enrolled successfully!')
        router.push('/admin/school/enrollments')
      } else {
        alert(data.error || 'Failed to enroll student')
      }
    } catch (error) {
      console.error('Error enrolling student:', error)
      alert('Failed to enroll student')
    } finally {
      setLoading(false)
    }
  }

  const selectedCourse = courses.find(c => c.id === formData.course_id)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/admin/school/enrollments"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Enrollments
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Enroll Student</h1>
          <p className="text-gray-600">Add a new student to a course</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Course *
            </label>
            <select
              value={formData.course_id}
              onChange={(e) => {
                const course = courses.find(c => c.id === e.target.value)
                setFormData({
                  ...formData, 
                  course_id: e.target.value,
                  payment_amount: course?.price?.toString() || ''
                })
              }}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select a course...</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title} - {course.level} - ${course.price || 0}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Student *
            </label>
            <select
              value={formData.user_id}
              onChange={(e) => setFormData({...formData, user_id: e.target.value})}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select a student...</option>
              {users.length === 0 ? (
                <option value="" disabled>No authenticated users yet - please sign up a user first</option>
              ) : (
                users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))
              )}
            </select>
            {users.length === 0 && (
              <p className="text-xs text-yellow-600 mt-1">
                ⚠️ No users found. Please create an account first, then come back to enroll.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Status
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({...formData, payment_status: e.target.value})}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.payment_amount}
                onChange={(e) => setFormData({...formData, payment_amount: e.target.value})}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              placeholder="Any special notes or requirements..."
            />
          </div>

          {selectedCourse && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Course Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Title:</span>
                  <div className="font-medium">{selectedCourse.title}</div>
                </div>
                <div>
                  <span className="text-gray-600">Level:</span>
                  <div className="font-medium">{selectedCourse.level}</div>
                </div>
                <div>
                  <span className="text-gray-600">Price:</span>
                  <div className="font-medium">${selectedCourse.price}</div>
                </div>
                <div>
                  <span className="text-gray-600">Max Students:</span>
                  <div className="font-medium">{selectedCourse.max_students}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t">
            <Link
              href="/admin/school/enrollments"
              className="flex-1 text-center py-3 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Enrolling...' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}