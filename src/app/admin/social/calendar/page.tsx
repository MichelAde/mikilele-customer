'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
    if (!result.data.user) {
      router.push('/')
    }
  }

  async function fetchPosts() {
    setLoading(true)
    
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const result = await supabase
      .from('social_posts')
      .select('id, platform, content, scheduled_at, status, events(title)')
      .not('scheduled_at', 'is', null)
      .gte('scheduled_at', firstDay.toISOString())
      .lte('scheduled_at', lastDay.toISOString())
      .order('scheduled_at', { ascending: true })

    if (!result.error && result.data) {
      setPosts(result.data as any)
    }
    setLoading(false)
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Social Media Calendar</h1>
            <p className="text-gray-600">View and manage your scheduled posts</p>
          </div>
          <Link
            href="/admin/social/create"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
          >
            Create New Post
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-100 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-4 text-center font-semibold text-gray-700">
                {day}
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
                  } ${isToday ? 'bg-purple-50' : ''}`}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-semibold mb-2 ${
                        isToday ? 'text-purple-600' : 'text-gray-700'
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayPosts.map((post) => {
                          const color = platformColors[post.platform] || 'bg-gray-500'
                          return (
                            <div
                              key={post.id}
                              className={`${color} text-white text-xs p-2 rounded cursor-pointer hover:opacity-90`}
                              title={`${post.events.title} - ${post.content.substring(0, 100)}...`}
                            >
                              <div className="font-semibold truncate">
                                {post.platform.charAt(0).toUpperCase()}
                              </div>
                              <div className="truncate opacity-90">
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

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Platform Legend</h3>
          <div className="flex flex-wrap gap-4">
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
  )
}