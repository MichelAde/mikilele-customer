'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Wand2, Copy, Check, Loader2, ArrowLeft } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

interface Event {
  id: string
  title: string
  start_datetime: string
  venue_name: string
  cover_image_url?: string
}

interface GeneratedPost {
  variation: number
  content: string
}

export default function CreateSocialPost() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [platform, setPlatform] = useState('facebook')
  const [content, setContent] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedEventId) {
      const event = events.find(e => e.id === selectedEventId)
      setSelectedEvent(event || null)
      // Convert Google Drive URL if needed
      setImageUrl(getImageUrl(event?.cover_image_url))
    }
  }, [selectedEventId, events])

  async function checkUser() {
    const result = await supabase.auth.getUser()
    console.log('User check:', result.data.user ? 'Authenticated' : 'Not authenticated')
    
    if (result.data.user) {
      console.log('User authenticated:', result.data.user.email)
    }
    setUser(result.data.user)
  }

  async function fetchEvents() {
    try {
      const result = await supabase
        .from('events')
        .select('id, title, start_datetime, venue_name, cover_image_url')
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true })
        .limit(50)

      console.log('Events query result:', result)

      if (result.error) {
        console.error('Events fetch error:', result.error)
        return
      }

      if (result.data) {
        console.log('Found events:', result.data.length)
        setEvents(result.data as Event[])
      }
    } catch (error) {
      console.error('Events fetch exception:', error)
    }
  }

  async function generatePosts() {
    if (!selectedEventId) {
      alert('Please select an event')
      return
    }

    setGenerating(true)
    setGeneratedPosts([])

    try {
      const response = await fetch('/api/generate-social-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId,
          platform,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedPosts(data.posts)
      } else {
        alert('Failed to generate posts: ' + data.error)
      }
    } catch (error) {
      console.error('Generate error:', error)
      alert('Failed to generate posts')
    } finally {
      setGenerating(false)
    }
  }

  function useGeneratedPost(post: string) {
    setContent(post)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function copyToClipboard(text: string, index: number) {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  async function savePost(status: 'draft' | 'scheduled') {
    if (!selectedEventId || !content) {
      alert('Please select an event and enter content')
      return
    }

    if (status === 'scheduled' && !scheduledAt) {
      alert('Please select a schedule time')
      return
    }

    setLoading(true)

    try {
      const result = await supabase.from('social_posts').insert({
        event_id: selectedEventId,
        platform,
        content,
        image_url: imageUrl,
        scheduled_at: status === 'scheduled' ? scheduledAt : null,
        status,
        created_by: user?.id,
      })

      if (result.error) throw result.error

      alert(`Post ${status === 'scheduled' ? 'scheduled' : 'saved as draft'} successfully!`)
      router.push('/admin/social/posts')
    } catch (error: any) {
      console.error('Save error:', error)
      alert('Failed to save post: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  function formatEventDateTime(start_datetime: string) {
    const date = new Date(start_datetime)
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    }
  }

  const platformColors: Record<string, string> = {
    facebook: 'bg-blue-500',
    instagram: 'bg-pink-500',
    twitter: 'bg-sky-500',
    linkedin: 'bg-blue-700',
  }

  const platformLabels: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter/X',
    linkedin: 'LinkedIn',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Social Media Post</h1>
          <p className="text-gray-600">Schedule posts for your events across social platforms</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Post Editor */}
          <div className="space-y-6">
            {/* Event Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium mb-2">Select Event</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Choose an event...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} - {new Date(event.start_datetime).toLocaleDateString()}
                  </option>
                ))}
              </select>

              {selectedEvent && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  {/* Event Image Preview */}
                  {imageUrl && (
                    <div className="mb-3">
                      <img
                        src={imageUrl}
                        alt={selectedEvent.title}
                        className="w-full h-40 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  
                  <h3 className="font-semibold mb-2">{selectedEvent.title}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatEventDateTime(selectedEvent.start_datetime).date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatEventDateTime(selectedEvent.start_datetime).time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {selectedEvent.venue_name}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Platform Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium mb-2">Platform</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(platformLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setPlatform(key)}
                    className={`p-3 rounded-lg border-2 transition ${
                      platform === key
                        ? `${platformColors[key]} text-white border-transparent`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Generation */}
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={generatePosts}
                disabled={!selectedEventId || generating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate AI Posts
                  </>
                )}
              </button>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium mb-2">Post Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post or generate one with AI..."
                rows={8}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              />
              <div className="mt-2 text-sm text-gray-500">
                {content.length} characters
                {platform === 'twitter' && content.length > 280 && (
                  <span className="text-red-500 ml-2">
                    (Twitter limit is 280 characters)
                  </span>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium mb-2">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... (automatically populated from event)"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              />
              <p className="mt-2 text-xs text-gray-500">
                Google Drive links are automatically converted to direct image URLs
              </p>
            </div>

            {/* Schedule Time */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium mb-2">Schedule For (optional)</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-3">
                <button
                  onClick={() => savePost('draft')}
                  disabled={loading}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => savePost('scheduled')}
                  disabled={loading || !scheduledAt}
                  className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Schedule Post'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - AI Suggestions */}
          <div>
            {generatedPosts.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">AI-Generated Suggestions</h2>
                <div className="space-y-4">
                  {generatedPosts.map((post, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-purple-600">
                          Variation {post.variation}
                        </span>
                        <button
                          onClick={() => copyToClipboard(post.content, index)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap mb-3">{post.content}</p>
                      <button
                        onClick={() => useGeneratedPost(post.content)}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Use This Post
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!generatedPosts.length && !generating && (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select an event and platform, then generate AI posts to see suggestions here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}