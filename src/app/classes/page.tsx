'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Calendar, Clock, MapPin, Users, Star, ArrowLeft } from 'lucide-react'

interface DanceStyle {
  id: string
  name: string
  description: string
  image_url: string | null
}

interface ClassLevel {
  id: string
  name: string
}

interface Instructor {
  id: string
  name: string
  photo_url: string | null
}

interface ClassTemplate {
  id: string
  name: string
  description: string
  duration_minutes: number
  day_of_week: number
  start_time: string
  location: string
  max_students: number
  dance_styles: DanceStyle
  class_levels: ClassLevel
  instructors: Instructor
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function ClassesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [classes, setClasses] = useState<ClassTemplate[]>([])
  const [danceStyles, setDanceStyles] = useState<DanceStyle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStyle, setSelectedStyle] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch dance styles
      const { data: stylesData } = await supabase
        .from('dance_styles')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      setDanceStyles(stylesData || [])

      // Fetch class templates
      const { data: classesData } = await supabase
        .from('class_templates')
        .select(`
          *,
          dance_styles (id, name, description, image_url),
          class_levels (id, name),
          instructors (id, name, photo_url)
        `)
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time')

      setClasses(classesData || [])
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClasses = classes.filter(cls => {
    if (selectedStyle !== 'all' && cls.dance_styles.id !== selectedStyle) return false
    if (selectedLevel !== 'all' && cls.class_levels.id !== selectedLevel) return false
    return true
  })

  const getStyleColor = (styleName: string) => {
    const colors: Record<string, string> = {
      'Semba': 'bg-orange-100 text-orange-800',
      'Kizomba': 'bg-purple-100 text-purple-800',
      'Zouk': 'bg-blue-100 text-blue-800',
    }
    return colors[styleName] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-4xl">💃</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dance Classes</h1>
              <p className="text-gray-600 mt-1">Learn Semba, Kizomba & Zouk with expert instructors</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* CTA Banner */}
        <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Ready to start dancing?</h2>
              <p className="text-indigo-100">Save money with class packages - the more you buy, the more you save!</p>
            </div>
            <Link
              href="/classes/packages"
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors whitespace-nowrap"
            >
              View Packages
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dance Style</label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Styles</option>
              {danceStyles.map(style => (
                <option key={style.id} value={style.id}>{style.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Classes List */}
        {filteredClasses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Class Image/Header */}
                <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-2">
                        {cls.dance_styles.name === 'Semba' && '🎵'}
                        {cls.dance_styles.name === 'Kizomba' && '💕'}
                        {cls.dance_styles.name === 'Zouk' && '🌊'}
                      </div>
                      <h3 className="text-xl font-bold">{cls.name}</h3>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStyleColor(cls.dance_styles.name)}`}>
                      {cls.dance_styles.name}
                    </span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-gray-800">
                      {cls.class_levels.name}
                    </span>
                  </div>
                </div>

                {/* Class Details */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {cls.description || cls.dance_styles.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{DAYS[cls.day_of_week]}s</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>
                        {cls.start_time} • {cls.duration_minutes} min
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{cls.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>Max {cls.max_students} students</span>
                    </div>

                    {cls.instructors && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>with {cls.instructors.name}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/classes/${cls.id}`}
                    className="block w-full text-center bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View Schedule & Enroll
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎫</div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Buy Package</h3>
              <p className="text-sm text-gray-600">Choose a class package that fits your schedule</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Book Classes</h3>
              <p className="text-sm text-gray-600">Reserve your spot in upcoming classes</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💃</div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Attend & Learn</h3>
              <p className="text-sm text-gray-600">Show up and dance with expert instructors</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🌟</div>
              <h3 className="font-semibold text-gray-900 mb-2">4. Track Progress</h3>
              <p className="text-sm text-gray-600">View your attendance and credits in your dashboard</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}