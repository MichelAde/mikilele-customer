'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Users, Edit, Trash2, RefreshCw } from 'lucide-react'

interface Segment {
  id: string
  name: string
  description: string
  segment_type: string
  filters: any
  estimated_size: number
  is_dynamic: boolean
  last_calculated_at: string
  created_at: string
}

export default function AudienceSegments() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const typeColors: { [key: string]: string } = {
    predefined: 'bg-blue-100 text-blue-800',
    custom: 'bg-purple-100 text-purple-800',
    dynamic: 'bg-green-100 text-green-800'
  }

  useEffect(() => {
    fetchSegments()
  }, [])

  async function fetchSegments() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('audience_segments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSegments(data || [])
    } catch (error) {
      console.error('Error fetching segments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteSegment(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const { error } = await supabase
        .from('audience_segments')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchSegments()
    } catch (error) {
      console.error('Error deleting segment:', error)
      alert('Failed to delete segment')
    }
  }

  async function recalculateSegment(id: string) {
    try {
      const response = await fetch('/api/segments/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segmentId: id })
      })

      const data = await response.json()

      if (data.success) {
        alert(`Segment calculated! Audience size: ${data.audienceSize.toLocaleString()}`)
        fetchSegments() // Refresh the list
      } else {
        alert('Calculation failed: ' + data.error)
      }
    } catch (error: any) {
      console.error('Error:', error)
      alert('Failed to calculate segment')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading segments...</p>
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
            href="/admin/campaigns"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Audience Segments</h1>
            <p className="text-gray-600">Create and manage audience segments for targeting</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/campaigns/segments/calculate-all"
              className="bg-white border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Calculate All
            </Link>
            <Link
              href="/admin/campaigns/segments/create"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Segment
            </Link>
          </div>
        </div>

        {/* Segments List */}
        {segments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No segments yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first audience segment to target specific groups
            </p>
            <Link
              href="/admin/campaigns/segments/create"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              Create Your First Segment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segments.map((segment) => (
              <div
                key={segment.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${typeColors[segment.segment_type] || 'bg-gray-100 text-gray-800'}`}>
                    {segment.segment_type.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2">{segment.name}</h3>
                
                {segment.description && (
                  <p className="text-gray-600 text-sm mb-4">{segment.description}</p>
                )}

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {segment.estimated_size?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-gray-500">Estimated Audience</div>
                </div>

                {segment.is_dynamic && (
                  <div className="flex items-center gap-2 text-xs text-green-600 mb-4">
                    <RefreshCw className="w-3 h-3" />
                    Auto-updates
                  </div>
                )}

                {segment.last_calculated_at && (
                  <div className="text-xs text-gray-500 mb-4">
                    Last updated: {new Date(segment.last_calculated_at).toLocaleDateString()}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Link
                    href={`/admin/campaigns/segments/${segment.id}/edit`}
                    className="flex-1 text-center py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => recalculateSegment(segment.id)}
                    className="py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium text-sm transition"
                    title="Recalculate size"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSegment(segment.id, segment.name)}
                    className="py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium text-sm transition"
                    title="Delete segment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}