'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Ticket } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface Event {
  id: string
  title: string
  start_datetime: string
}

export default function CreateTicketType() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  
  const [formData, setFormData] = useState({
    event_id: '',
    name: '',
    description: '',
    price: '',
    quantity_available: '',
    sale_start_date: '',
    sale_end_date: '',
    is_active: true,
    max_per_order: '',
    min_per_order: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_datetime')
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.event_id || !formData.name || !formData.price || !formData.quantity_available) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/events/ticket-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        alert('Ticket type created successfully!')
        router.push('/admin/events/ticket-types')
      } else {
        alert(data.error || 'Failed to create ticket type')
      }
    } catch (error) {
      console.error('Error creating ticket type:', error)
      alert('Failed to create ticket type')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/admin/events/ticket-types"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Ticket Types
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Ticket Type</h1>
          <p className="text-gray-600">Set up a new ticket type for your event</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          {/* Event Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Event *
            </label>
            <select
              value={formData.event_id}
              onChange={(e) => setFormData({...formData, event_id: e.target.value})}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select an event...</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title} - {new Date(event.start_datetime).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {/* Ticket Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ticket Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Early Bird, VIP, General Admission"
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe what's included with this ticket..."
              rows={3}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Price and Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0.00"
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Quantity Available *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity_available}
                onChange={(e) => setFormData({...formData, quantity_available: e.target.value})}
                placeholder="100"
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          {/* Per Order Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Per Order
              </label>
              <input
                type="number"
                min="1"
                value={formData.min_per_order}
                onChange={(e) => setFormData({...formData, min_per_order: e.target.value})}
                placeholder="1"
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Maximum Per Order
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_per_order}
                onChange={(e) => setFormData({...formData, max_per_order: e.target.value})}
                placeholder="10"
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Sale Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Sale Start Date
              </label>
              <input
                type="datetime-local"
                value={formData.sale_start_date}
                onChange={(e) => setFormData({...formData, sale_start_date: e.target.value})}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Sale End Date
              </label>
              <input
                type="datetime-local"
                value={formData.sale_end_date}
                onChange={(e) => setFormData({...formData, sale_end_date: e.target.value})}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="w-4 h-4"
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              Active (tickets available for purchase)
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Link
              href="/admin/events/ticket-types"
              className="flex-1 text-center py-3 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Creating...' : 'Create Ticket Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}