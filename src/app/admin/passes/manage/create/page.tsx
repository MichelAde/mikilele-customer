'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, CreditCard } from 'lucide-react'

export default function CreatePass() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'monthly',
    price: '',
    duration_days: '',
    max_events: '',
    is_active: true,
    features: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.name || !formData.type || !formData.price) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/passes/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        alert('Pass created successfully!')
        router.push('/admin/passes/manage')
      } else {
        alert(data.error || 'Failed to create pass')
      }
    } catch (error) {
      console.error('Error creating pass:', error)
      alert('Failed to create pass')
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
            href="/admin/passes/manage"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Passes
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Pass</h1>
          <p className="text-gray-600">Set up a new multi-event pass product</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          {/* Pass Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Pass Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Monthly All-Access Pass"
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
              placeholder="Describe what this pass includes..."
              rows={3}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Pass Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Pass Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="single_event">Single Event</option>
              <option value="monthly">Monthly Pass</option>
              <option value="all_access">All Access</option>
              <option value="custom">Custom</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.type === 'single_event' && 'Access to one event'}
              {formData.type === 'monthly' && 'Valid for 30 days with event limits'}
              {formData.type === 'all_access' && 'Unlimited events for duration'}
              {formData.type === 'custom' && 'Custom configuration'}
            </p>
          </div>

          {/* Price */}
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

          {/* Duration and Max Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                value={formData.duration_days}
                onChange={(e) => setFormData({...formData, duration_days: e.target.value})}
                placeholder="30"
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                How many days is this pass valid? Leave empty for no expiration.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Max Events
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_events}
                onChange={(e) => setFormData({...formData, max_events: e.target.value})}
                placeholder="Unlimited"
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum number of events. Leave empty for unlimited.
              </p>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Features
            </label>
            <textarea
              value={formData.features}
              onChange={(e) => setFormData({...formData, features: e.target.value})}
              placeholder="e.g., Priority entry, Free drink, Meet & greet access"
              rows={3}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
            />
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
              Active (pass available for purchase)
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Link
              href="/admin/passes/manage"
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
              {loading ? 'Creating...' : 'Create Pass'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}