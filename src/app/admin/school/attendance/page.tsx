'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  BookOpen,
  Filter,
  Download
} from 'lucide-react'

interface AttendanceRecord {
  id: string
  enrollment_id: string
  course_id: string
  date: string
  status: string
  notes: string | null
  created_at: string
  enrollments?: {
    id: string
    user_id: string
    courses?: {
      title: string
      instructor: string
    }
  }
}

interface Course {
  id: string
  title: string
  instructor: string
}

export default function AttendanceManagement() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('')

  useEffect(() => {
    fetchCourses()
    fetchAttendance()
  }, [])

  async function fetchCourses() {
    try {
      const response = await fetch('/api/courses/manage')
      const data = await response.json()

      if (data.success) {
        setCourses(data.courses)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  async function fetchAttendance() {
    setLoading(true)
    try {
      const url = selectedCourse !== 'all' 
        ? `/api/attendance/manage?courseId=${selectedCourse}`
        : '/api/attendance/manage'
        
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setAttendance(data.attendance)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [selectedCourse])

  const statusColors: { [key: string]: string } = {
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
    excused: 'bg-blue-100 text-blue-800'
  }

  const statusIcons: { [key: string]: any } = {
    present: CheckCircle,
    absent: XCircle,
    late: Clock,
    excused: Calendar
  }

  const filteredAttendance = attendance.filter(record => {
    if (selectedDate && record.date !== selectedDate) return false
    return true
  })

  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
    attendanceRate: attendance.length > 0 
      ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(1)
      : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance...</p>
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
            <h1 className="text-3xl font-bold mb-2">Attendance & Progress</h1>
            <p className="text-gray-600">Track student attendance and course progress</p>
          </div>
          <Link
            href="/admin/school/attendance/check-in"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Check-In Student
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Total Records</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Present</div>
            <div className="text-3xl font-bold text-green-600">{stats.present}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Absent</div>
            <div className="text-3xl font-bold text-red-600">{stats.absent}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Late</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.late}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Attendance Rate</div>
            <div className="text-3xl font-bold text-purple-600">{stats.attendanceRate}%</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded-lg px-4 py-2"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Date
              </button>
            )}
            <div className="ml-auto text-sm text-gray-500">
              Showing {filteredAttendance.length} of {attendance.length} records
            </div>
          </div>
        </div>

        {/* Attendance List */}
        {filteredAttendance.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No attendance records yet</h3>
            <p className="text-gray-600 mb-6">
              Start tracking student attendance with check-ins
            </p>
            <Link
              href="/admin/school/attendance/check-in"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              Record First Check-In
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Course</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Instructor</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Notes</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((record) => {
                    const StatusIcon = statusIcons[record.status] || CheckCircle
                    
                    return (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="font-medium">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium">
                            {record.enrollments?.courses?.title || 'Unknown Course'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-600">
                            {record.enrollments?.courses?.instructor || 'N/A'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-semibold ${
                            statusColors[record.status] || 'bg-gray-100 text-gray-800'
                          }`}>
                            <StatusIcon className="w-3 h-3" />
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-600">
                            {record.notes || '-'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-500">
                            {new Date(record.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}