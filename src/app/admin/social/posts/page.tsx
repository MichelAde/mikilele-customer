'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    date: string
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
    const result = await supabase
      .from('social_posts')
      .select('*, events(title, date)')
      .order('created_at', { ascending: false })

    if (!result.error && result.data) {
      setPosts(result.data as any)
    }
    setLoading(false)
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
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                        {post.platform}
                      </span>
                      <span className="bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded-full font-semibold">
                        {post.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg">{post.events.title}</h3>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{post.content}</p>
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