'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface SocialPost {
  id: string
  platform: string
  content: string
  scheduled_at: string
  status: string
  events: {
    title: string
  }
}

export default function SocialCalendar() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchPosts()
  }, [currentDate])
  
  async function checkUser() {
    const result = await supabase.auth.getUser()
    console.log('User check:', result.data.user ? 'Authenticated' : 'Not authenticated')
    
    if (result.data.user) {
      console.log('User authenticated:', result.data.user.email)
      setUser(result.data.user)
    } else {
      console.log('No user found, but allowing access anyway')
      setUser(null)
    }
  }

  async function fetchPosts() {
    setLoading(true)
    
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    try {
      const result = await supabase
        .from('social_posts')
        .select('id, platform, content, scheduled_at, status, events(title)')
        .not('scheduled_at', 'is', null)
        .gte('scheduled_at', firstDay.toISOString())
        .lte('scheduled_at', lastDay.toISOString())
        .order('scheduled_at', { ascending: true })

      console.log('Calendar posts query result:', result)

      if (result.error) {
        console.error('Posts fetch error:', result.error)
      }

      if (result.data) {
        console.log('Found scheduled posts:', result.data.length)
        setPosts(result.data as any)
      }
    } catch (error) {
      console.error('Posts fetch exception:', error)
    } finally {
      setLoading(false)
    }
  }

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  function getPostsForDay(date: Date | null) {
    if (!date) return []
    
    return posts.filter((post) => {
      const postDate = new Date(post.scheduled_at)
      return (
        postDate.getDate() === date.getDate() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getFullYear() === date.getFullYear()
      )
    })
  }

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  function goToToday() {
    setCurrentDate(new Date())
  }

  const platformColors: Record<string, string> = {
    facebook: 'bg-blue-500',
    instagram: 'bg-pink-500',
    twitter: 'bg-sky-500',
    linkedin: 'bg-blue-700',
  }

  const days = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
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

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Social Media Calendar</h1>
            <p className="text-gray-600">View and manage your scheduled posts</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/social/posts"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Posts Library
            </Link>
            <Link
              href="/admin/social/create"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              Create New Post
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Previous month"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">{monthName}</h2>
              <button
                onClick={goToToday}
                className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
              >
                Today
              </button>
            </div>
            
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Next month"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-100 border-b">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
              <div key={day} className="p-4 text-center font-semibold text-gray-700">
                <span className="hidden md:inline">{day}</span>
                <span className="md:hidden">{day.substring(0, 3)}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((date, index) => {
              const dayPosts = getPostsForDay(date)
              const isToday = date && 
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear()

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-b border-r ${
                    !date ? 'bg-gray-50' : ''
                  } ${isToday ? 'bg-purple-50 ring-2 ring-purple-300 ring-inset' : ''}`}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-semibold mb-2 ${
                        isToday ? 'text-purple-600' : 'text-gray-700'
                      }`}>
                        {date.getDate()}
                        {isToday && (
                          <span className="ml-1 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayPosts.length === 0 && (
                          <div className="text-xs text-gray-400 italic">No posts</div>
                        )}
                        {dayPosts.map((post) => {
                          const color = platformColors[post.platform] || 'bg-gray-500'
                          return (
                            <div
                              key={post.id}
                              className={`${color} text-white text-xs p-2 rounded cursor-pointer hover:opacity-90 transition`}
                              title={`${post.events.title}\n${post.content.substring(0, 100)}...`}
                            >
                              <div className="font-semibold uppercase text-[10px] mb-1">
                                {post.platform}
                              </div>
                              <div className="truncate opacity-90 text-[11px]">
                                {post.events.title}
                              </div>
                              <div className="truncate opacity-75 text-[10px] mt-1">
                                {new Date(post.scheduled_at).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats and Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-3">This Month's Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Scheduled Posts</span>
                <span className="font-bold text-lg">{posts.length}</span>
              </div>
              {Object.entries(platformColors).map(([platform, color]) => {
                const count = posts.filter(p => p.platform === platform).length
                if (count === 0) return null
                return (
                  <div key={platform} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 ${color} rounded`}></div>
                      <span className="text-sm text-gray-600 capitalize">{platform}</span>
                    </div>
                    <span className="font-semibold">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Platform Legend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-3">Platform Legend</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Facebook</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-pink-500 rounded"></div>
                <span className="text-sm">Instagram</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-sky-500 rounded"></div>
                <span className="text-sm">Twitter/X</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-700 rounded"></div>
                <span className="text-sm">LinkedIn</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}