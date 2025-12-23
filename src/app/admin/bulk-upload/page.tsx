'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Upload, Check, Image as ImageIcon } from 'lucide-react'

interface Event {
  id: string
  title: string
  image_url: string | null
  start_datetime: string
}

export default function BulkImageUploadPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  )

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, image_url, start_datetime')
        .order('start_datetime', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(eventId: string, eventTitle: string, file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploading(eventId)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${eventId}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('events')
        .update({ image_url: urlData.publicUrl })
        .eq('id', eventId)

      if (updateError) throw updateError

      setEvents(prev => prev.map(e => 
        e.id === eventId ? { ...e, image_url: urlData.publicUrl } : e
      ))

      alert(`Image uploaded for ${eventTitle}`)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Event Images Upload</h1>
        <p className="text-gray-600">Upload images for your events</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Events</p>
          <p className="text-2xl font-bold">{events.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">With Images</p>
          <p className="text-2xl font-bold text-green-600">
            {events.filter(e => e.image_url).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Missing Images</p>
          <p className="text-2xl font-bold text-red-600">
            {events.filter(e => !e.image_url).length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative h-48 bg-gray-100">
              {event.image_url ? (
                <>
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
                    <Check className="w-4 h-4" />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-1 truncate">
                {event.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {new Date(event.start_datetime).toLocaleDateString()}
              </p>

              <label className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition cursor-pointer">
                <Upload className="w-4 h-4" />
                {uploading === event.id ? 'Uploading...' : event.image_url ? 'Replace' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(event.id, event.title, file)
                  }}
                  disabled={uploading === event.id}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}