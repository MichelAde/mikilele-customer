'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Calendar, ArrowLeft, Loader2, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react'

interface StudentPackage {
  id: string
  credits_remaining: number
  credits_total: number
  purchase_date: string
  expiry_date: string | null
  status: string
  amount_paid: number
  class_packages: {
    name: string
    description: string
  }
}

interface Enrollment {
  id: string
  enrollment_date: string
  status: string
  class_instances: {
    id: string
    class_date: string
    start_time: string
    end_time: string
    location: string
    status: string
    class_templates: {
      name: string
      dance_styles: {
        name: string
      }
      class_levels: {
        name: string
      }
      instructors: {
        name: string
      }
    }
  }
}

export default function MyClassesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [packages, setPackages] = useState<StudentPackage[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    } else if (user) {
      fetchData()
    }
  }, [user, authLoading, router])

  const fetchData = async () => {
    try {
      // Fetch student packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('student_packages')
        .select(`
          *,
          class_packages (name, description)
        `)
        .eq('user_id', user?.id)
        .order('purchase_date', { ascending: false })

      if (packagesError) throw packagesError
      setPackages(packagesData || [])

      // Fetch enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('class_enrollments')
        .select(`
          *,
          class_instances (
            id,
            class_date,
            start_time,
            end_time,
            location,
            status,
            class_templates (
              name,
              dance_styles (name),
              class_levels (name),
              instructors (name)
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('enrollment_date', { ascending: false })
        .limit(20)

      if (enrollmentsError) throw enrollmentsError
      setEnrollments(enrollmentsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      depleted: 'bg-gray-100 text-gray-800',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const text = {
      active: 'Active',
      expired: 'Expired',
      depleted: 'Used Up',
    }
    return text[status as keyof typeof text] || status
  }

  const getEnrollmentStatusIcon = (status: string) => {
    if (status === 'attended') return <CheckCircle className="w-5 h-5 text-green-600" />
    if (status === 'no-show') return <XCircle className="w-5 h-5 text-red-600" />
    if (status === 'cancelled') return <XCircle className="w-5 h-5 text-gray-600" />
    return <Calendar className="w-5 h-5 text-indigo-600" />
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/classes"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Classes
          </Link>
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Packages */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Packages</h2>
              
              {packages.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No packages yet</p>
                  <Link
                    href="/classes/packages"
                    className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Browse Packages
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {pkg.class_packages.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {pkg.class_packages.description}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(pkg.status)}`}>
                          {getStatusText(pkg.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-indigo-50 rounded-lg p-4">
                          <p className="text-sm text-indigo-600 font-medium mb-1">Credits Left</p>
                          <p className="text-3xl font-bold text-indigo-900">
                            {pkg.credits_remaining}
                          </p>
                          <p className="text-xs text-indigo-600 mt-1">
                            of {pkg.credits_total} total
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 font-medium mb-1">Expires</p>
                          <p className="text-lg font-bold text-gray-900">
                            {pkg.expiry_date
                              ? new Date(pkg.expiry_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Classes */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Enrolled Classes</h2>
              
              {enrollments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No classes booked yet</p>
                  <Link
                    href="/classes"
                    className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Browse Classes
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex items-start gap-4">
                        {getEnrollmentStatusIcon(enrollment.status)}
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">
                            {enrollment.class_instances.class_templates.name}
                          </h3>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                              {enrollment.class_instances.class_templates.dance_styles.name}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                              {enrollment.class_instances.class_templates.class_levels.name}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>
                                {new Date(enrollment.class_instances.class_date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>
                                {enrollment.class_instances.start_time} - {enrollment.class_instances.end_time}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{enrollment.class_instances.location}</span>
                            </div>
                          </div>

                          <div className="mt-3 text-sm">
                            <span className="text-gray-500">Instructor: </span>
                            <span className="font-medium text-gray-900">
                              {enrollment.class_instances.class_templates.instructors.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Packages</span>
                  <span className="font-bold text-gray-900">
                    {packages.filter(p => p.status === 'active').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Credits</span>
                  <span className="font-bold text-gray-900">
                    {packages.reduce((sum, p) => sum + p.credits_remaining, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Classes Booked</span>
                  <span className="font-bold text-gray-900">
                    {enrollments.filter(e => e.status === 'enrolled').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Classes Attended</span>
                  <span className="font-bold text-gray-900">
                    {enrollments.filter(e => e.status === 'attended').length}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/classes/packages"
              className="block w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors text-center"
            >
              Buy More Credits
            </Link>

            <Link
              href="/classes"
              className="block w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              Browse Classes
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}