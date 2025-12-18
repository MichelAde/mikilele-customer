'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, CheckCircle } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface Enrollment {
  id: string
  course_id: string
  user_id: string
  courses: {
    title: string
    instructor: string
  } | null
  users: {
    email: string
  } | null
}

export default function CheckInStudent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  
  const [formData, setFormData] = useState({
    enrollment_id: '',
    course_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    notes: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchEnrollments()
  }, [])

  async function fetchEnrollments() {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          course_id,
          user_id,
          courses (title, instructor),
          users (email)
        `)
        .eq('status', 'active')
        .order('enrolled_at', { ascending: false })

      if (error) throw error
      setEnrollments(data?.map(enrollment => ({
        ...enrollment,
        courses: enrollment.courses[0] || null,
        users: enrollment.users[0] || null
      })) || []) 
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.enrollment_id || !formData.course_id) {
      alert('Please select a student')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/attendance/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        alert('Check-in recorded successfully!')
        router.push('/admin/school/attendance')
      } else {
        alert(data.error || 'Failed to record check-in')
      }
    } catch (error) {
      console.error('Error recording check-in:', error)
      alert('Failed to record check-in')
    } finally {
      setLoading(false)
    }
  }

  const selectedEnrollment = enrollments.find(e => e.id === formData.enrollment_id)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/admin/school/attendance"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Attendance
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Student Check-In</h1>
          <p className="text-gray-600">Record student attendance for today's class</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Student & Course *
            </label>
            <select
              value={formData.enrollment_id}
              onChange={(e) => {
                const enrollment = enrollments.find(enr => enr.id === e.target.value)
                setFormData({
                  ...formData,
                  enrollment_id: e.target.value,
                  course_id: enrollment?.course_id || ''
                })
              }}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select a student...</option>
              {enrollments.map(enrollment => (
                <option key={enrollment.id} value={enrollment.id}>
                    {enrollment.users?.email || 'No email'} - {enrollment.courses?.title || 'No course'}
                </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
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
              placeholder="Any notes about attendance..."
            />
          </div>

          {selectedEnrollment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Check-In Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                  <span className="text-gray-600">Student:</span>
                  <div className="font-medium">{selectedEnrollment.users?.email || 'Unknown'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Course:</span>
                  <div className="font-medium">{selectedEnrollment.courses?.title || 'No course'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Instructor:</span>
                  <div className="font-medium">{selectedEnrollment.courses?.instructor || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <div className="font-medium">
                    {new Date(formData.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t">
            <Link
              href="/admin/school/attendance"
              className="flex-1 text-center py-3 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              {loading ? 'Recording...' : 'Record Check-In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}