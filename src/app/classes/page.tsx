'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Users, DollarSign, Clock, CheckCircle, MapPin } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface Course {
  id: string
  title: string
  slug: string
  description: string
  level: string
  duration_weeks: number
  max_students: number
  price: number
  instructor: string
  schedule: any
  start_date: string
  category: string
  is_active: boolean
}

interface ClassPackage {
  id: string
  name: string
  description: string
  credits: number
  price: number
  validity_days: number
  is_active: boolean
}

export default function ClassesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [packages, setPackages] = useState<ClassPackage[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  )

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: true })

      if (coursesError) {
        console.error('Error fetching courses:', coursesError)
      } else {
        setCourses(coursesData || [])
      }

      const { data: packagesData, error: packagesError } = await supabase
        .from('class_packages')
        .select('*')
        .eq('is_active', true)

      if (packagesError) {
        console.error('Error fetching packages:', packagesError)
      } else {
        setPackages(packagesData || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  function getScheduleDisplay(schedule: any) {
    if (typeof schedule === 'string') return schedule
    if (schedule?.display) return schedule.display
    if (schedule?.day && schedule?.time) return `${schedule.day}s ${schedule.time}`
    return 'Schedule TBD'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Mikilele Kizomba & Semba School
          </h1>
          <p className="text-xl opacity-90 mb-6">
            Progressive classes every Thursday • All levels welcome • No partner required
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>Trinity United Church, Ottawa</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>7:00 PM - 9:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Limited to 30 students per block</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Every Thursday Night</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">7:00 - 8:00 PM</h3>
              <p className="text-gray-600 text-sm">Progressive Class</p>
            </div>
            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-pink-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">8:00 - 8:20 PM</h3>
              <p className="text-gray-600 text-sm">Guided Practice</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">8:20 - 8:30 PM</h3>
              <p className="text-gray-600 text-sm">Closing Circle</p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-indigo-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">8:30 - 9:00 PM</h3>
              <p className="text-gray-600 text-sm">Free Social Prática</p>
            </div>
          </div>
          <div className="mt-8 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Last Thursday of each month:</strong> Extended social night with special activities!
            </p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">2026 Course Blocks</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold uppercase opacity-90">
                      {course.level}
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {course.duration_weeks} weeks
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold">{course.title}</h3>
                </div>

                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Starts</p>
                        <p className="font-semibold">{formatDate(course.start_date)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Schedule</p>
                        <p className="font-semibold">{getScheduleDisplay(course.schedule)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Capacity</p>
                        <p className="font-semibold">15 Lead / 15 Follow</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Pricing</p>
                        <p className="font-semibold">${course.price} block / $25 drop-in</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-6">{course.description}</p>

                  <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {packages.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Drop-In & Prática Options</h2>
            <p className="text-gray-600 mb-8">
              Can&apos;t commit to a full block? Join us for individual classes or social practice sessions.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200 hover:border-purple-400 transition">
                  <h3 className="text-2xl font-bold mb-3">{pkg.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-purple-600">${pkg.price}</span>
                    <span className="text-gray-500">per class</span>
                  </div>
                  <p className="text-gray-600 mb-6">{pkg.description}</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{pkg.credits} credit{pkg.credits > 1 ? 's' : ''}</span>
                    </div>
                    {pkg.validity_days && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Valid for {pkg.validity_days} days</span>
                      </div>
                    )}
                  </div>
                  <button className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition">
                    Purchase
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">What&apos;s Included</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Progressive Instruction</h4>
                <p className="text-sm text-gray-600">Build skills week by week</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">No Partner Required</h4>
                <p className="text-sm text-gray-600">We rotate partners</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Free Social Practice</h4>
                <p className="text-sm text-gray-600">Prática included</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Small Class Sizes</h4>
                <p className="text-sm text-gray-600">Max 30 students</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Your Dance Journey?</h2>
          <p className="text-gray-600 mb-6">
            Join Ottawa&apos;s premier Kizomba & Semba school. All levels welcome!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Create Account & Enroll
            </Link>
            <a
              href="mailto:mikileleevents@gmail.com"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}