'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Filter
} from 'lucide-react'

interface Enrollment {
  id: string
  course_id: string
  user_id: string
  status: string
  payment_status: string
  payment_amount: number | null
  progress: number
  enrolled_at: string
  completed_at: string | null
  notes: string | null
  courses?: {
    title: string
    level: string
    instructor: string
    max_students: number
  }
  users?: {
    id: string
    email: string
  }
}

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPayment, setFilterPayment] = useState<string>('all')
  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchEnrollments()
  }, [])

  async function fetchEnrollments() {
    setLoading(true)
    try {
      const response = await fetch('/api/enrollments/manage')
      const data = await response.json()

      if (data.success) {
        setEnrollments(data.enrollments)
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteEnrollment(id: string) {
    if (!confirm('Are you sure you want to delete this enrollment?')) return

    try {
      const response = await fetch(`/api/enrollments/manage?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        alert('Enrollment deleted successfully!')
        fetchEnrollments()
      } else {
        alert(data.error || 'Failed to delete enrollment')
      }
    } catch (error) {
      console.error('Error deleting enrollment:', error)
      alert('Failed to delete enrollment')
    }
  }

  async function updateStatus(enrollment: Enrollment, newStatus: string) {
    try {
      const response = await fetch('/api/enrollments/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: enrollment.id,
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
      })

      const data = await response.json()

      if (data.success) {
        fetchEnrollments()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const statusColors: { [key: string]: string } = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    dropped: 'bg-red-100 text-red-800',
    waitlist: 'bg-yellow-100 text-yellow-800'
  }

  const paymentColors: { [key: string]: string } = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (filterStatus !== 'all' && enrollment.status !== filterStatus) return false
    if (filterPayment !== 'all' && enrollment.payment_status !== filterPayment) return false
    return true
  })

  const stats = {
    total: enrollments.length,
    active: enrollments.filter(e => e.status === 'active').length,
    completed: enrollments.filter(e => e.status === 'completed').length,
    waitlist: enrollments.filter(e => e.status === 'waitlist').length,
    revenue: enrollments
      .filter(e => e.payment_status === 'paid')
      .reduce((sum, e) => sum + (e.payment_amount || 0), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading enrollments...</p>
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
            <h1 className="text-3xl font-bold mb-2">Enrollment Management</h1>
            <p className="text-gray-600">Manage student enrollments and track progress</p>
          </div>
          <Link
            href="/admin/school/enrollments/create"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Enroll Student
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Total Enrollments</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Active</div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Completed</div>
            <div className="text-3xl font-bold text-blue-600">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Waitlist</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.waitlist}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Revenue</div>
            <div className="text-2xl font-bold text-green-600">${stats.revenue.toLocaleString()}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
              <option value="waitlist">Waitlist</option>
            </select>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <div className="ml-auto text-sm text-gray-500">
              Showing {filteredEnrollments.length} of {enrollments.length} enrollments
            </div>
          </div>
        </div>

        {/* Enrollments List */}
        {filteredEnrollments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No enrollments yet</h3>
            <p className="text-gray-600 mb-6">
              Start enrolling students in your courses
            </p>
            <Link
              href="/admin/school/enrollments/create"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              Enroll Your First Student
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Student</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Course</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Payment</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Progress</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Enrolled</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-medium">{enrollment.users?.email || 'Unknown User'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium">{enrollment.courses?.title}</div>
                        <div className="text-sm text-gray-500">{enrollment.courses?.instructor}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          statusColors[enrollment.status] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {enrollment.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            paymentColors[enrollment.payment_status] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {enrollment.payment_status.toUpperCase()}
                          </span>
                        </div>
                        {enrollment.payment_amount && (
                          <div className="text-sm text-gray-600 mt-1">
                            ${enrollment.payment_amount.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{enrollment.progress}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600">
                          {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end gap-2">
                          {enrollment.status === 'active' && (
                            <button
                              onClick={() => updateStatus(enrollment, 'completed')}
                              className="p-2 hover:bg-blue-100 rounded-lg transition"
                              title="Mark as completed"
                            >
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                            </button>
                          )}
                          <Link
                            href={`/admin/school/enrollments/${enrollment.id}/edit`}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Edit enrollment"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </Link>
                          {/* Wrap Delete button with permission check */}
                          {hasPermission('enrollments', 'delete') && (
                          <button
                            onClick={() => deleteEnrollment(enrollment.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition"
                            title="Delete enrollment"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}