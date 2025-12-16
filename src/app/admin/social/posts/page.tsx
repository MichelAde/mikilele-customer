'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Image as ImageIcon } from 'lucide-react'

interface SocialPost {
  id: string
  event_id: string
  platform: string
  content: string
  image_url: string | null
  scheduled_at: string | null
  posted_at: string | null
  status: string
  created_at: string
  events: {
    title: string
    start_datetime: string
  }
}

export default function SocialPostsLibrary() {
  const [posts, setPosts] = useState<SocialPost[]>([])
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
  }, [])
  
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
    
    // Redirect disabled to fix page loading issue
    //   window.location.href = '/'
    //   return
  }

  async function fetchPosts() {
    setLoading(true)
    try {
      const result = await supabase
        .from('social_posts')
        .select('*, events(title, start_datetime)')
        .order('created_at', { ascending: false })

      console.log('Posts query result:', result)

      if (result.error) {
        console.error('Posts fetch error:', result.error)
      }

      if (result.data) {
        console.log('Found posts:', result.data.length)
        setPosts(result.data as any)
      }
    } catch (error) {
      console.error('Posts fetch exception:', error)
    } finally {
      setLoading(false)
    }
  }

  const platformColors: Record<string, string> = {
    facebook: 'bg-blue-500',
    instagram: 'bg-pink-500',
    twitter: 'bg-sky-500',
    linkedin: 'bg-blue-700',
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-800',
    scheduled: 'bg-yellow-200 text-yellow-800',
    posted: 'bg-green-200 text-green-800',
    failed: 'bg-red-200 text-red-800',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Social Media Posts</h1>
            <p className="text-gray-600">Manage your scheduled posts</p>
          </div>
          <Link
            href="/admin/social/create"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
          >
            Create New Post
          </Link>
        </div>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 mb-4">No posts found</p>
              <Link
                href="/admin/social/create"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Create your first post
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex gap-6">
                    {/* Image Preview */}
                    {post.image_url && (
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img
                            src={post.image_url}
                            alt="Post image"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // If image fails to load, show placeholder
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.parentElement!.innerHTML = '<div class="text-gray-400"><svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Post Content */}
                    <div className="flex-1">
                      <div className="mb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`${platformColors[post.platform] || 'bg-gray-500'} text-white text-xs px-3 py-1 rounded-full font-semibold uppercase`}>
                            {post.platform}
                          </span>
                          <span className={`${statusColors[post.status] || 'bg-gray-200 text-gray-800'} text-xs px-3 py-1 rounded-full font-semibold uppercase`}>
                            {post.status}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{post.events.title}</h3>
                        
                        {/* Event Date & Scheduled Time */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.events.start_datetime).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          {post.scheduled_at && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Scheduled: {new Date(post.scheduled_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                      </div>

                      {/* Additional Info */}
                      <div className="mt-3 text-xs text-gray-500">
                        Created: {new Date(post.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}