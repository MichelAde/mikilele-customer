'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  CreditCard,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Infinity
} from 'lucide-react'

interface Pass {
  id: string
  name: string
  description: string
  type: string
  price: number
  duration_days: number | null
  max_events: number | null
  is_active: boolean
  features: string | null
  created_at: string
  total_sold?: number
}

export default function PassManagement() {
  const [passes, setPasses] = useState<Pass[]>([])
  const [loading, setLoading] = useState(true)
  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchPasses()
  }, [])

  async function fetchPasses() {
    setLoading(true)
    try {
      const response = await fetch('/api/passes/manage')
      const data = await response.json()

      if (data.success) {
        setPasses(data.passes)
      }
    } catch (error) {
      console.error('Error fetching passes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deletePass(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const response = await fetch(`/api/passes/manage?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        alert('Pass deleted successfully!')
        fetchPasses()
      } else {
        alert(data.error || 'Failed to delete pass')
      }
    } catch (error) {
      console.error('Error deleting pass:', error)
      alert('Failed to delete pass')
    }
  }

  async function toggleActive(pass: Pass) {
    try {
      const response = await fetch('/api/passes/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pass.id,
          is_active: !pass.is_active
        })
      })

      const data = await response.json()

      if (data.success) {
        fetchPasses()
      }
    } catch (error) {
      console.error('Error toggling active status:', error)
    }
  }

  const typeLabels: { [key: string]: string } = {
    single_event: 'Single Event',
    monthly: 'Monthly',
    all_access: 'All Access',
    custom: 'Custom'
  }

  const typeColors: { [key: string]: string } = {
    single_event: 'bg-blue-100 text-blue-800',
    monthly: 'bg-purple-100 text-purple-800',
    all_access: 'bg-green-100 text-green-800',
    custom: 'bg-orange-100 text-orange-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading passes...</p>
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

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pass Management</h1>
            <p className="text-gray-600">Create and manage multi-event pass products</p>
          </div>
          <Link
            href="/admin/passes/manage/create"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Pass
          </Link>
        </div>

        {/* Passes List */}
        {passes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <CreditCard className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No passes yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first pass to offer multi-event access to customers
            </p>
            <Link
              href="/admin/passes/manage/create"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              Create Your First Pass
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {passes.map((pass) => (
              <div
                key={pass.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${
                    pass.is_active ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <CreditCard className={`w-6 h-6 ${
                      pass.is_active ? 'text-green-600' : 'text-gray-600'
                    }`} />
                  </div>
                  {pass.is_active ? (
                    <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-800 font-semibold flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      INACTIVE
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-2">{pass.name}</h3>
                
                <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold mb-3 ${
                  typeColors[pass.type] || 'bg-gray-100 text-gray-800'
                }`}>
                  {typeLabels[pass.type] || pass.type}
                </span>

                {pass.description && (
                  <p className="text-gray-600 text-sm mb-4">{pass.description}</p>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="text-xs text-gray-500">Price</div>
                      <div className="font-semibold">${pass.price.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs text-gray-500">Sold</div>
                      <div className="font-semibold">{pass.total_sold || 0}</div>
                    </div>
                  </div>

                  {pass.duration_days && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="text-xs text-gray-500">Duration</div>
                        <div className="font-semibold">{pass.duration_days} days</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {pass.max_events ? (
                      <>
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <div>
                          <div className="text-xs text-gray-500">Max Events</div>
                          <div className="font-semibold">{pass.max_events}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Infinity className="w-4 h-4 text-indigo-600" />
                        <div>
                          <div className="text-xs text-gray-500">Events</div>
                          <div className="font-semibold">Unlimited</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Features */}
                {pass.features && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Features</div>
                    <div className="text-sm">{pass.features}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => toggleActive(pass)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition ${
                      pass.is_active 
                        ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' 
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                  >
                    {pass.is_active ? 'Deactivate' : 'Activate'}
                  </button>

                  <Link
                    href={`/admin/passes/manage/${pass.id}/edit`}
                    className="py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  {/* Wrap Delete button with permission check */}
                  {hasPermission('passes', 'delete') && (
                  <button
                    onClick={() => deletePass(pass.id, pass.name)}
                    className="py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium text-sm transition"
                    disabled={(pass.total_sold || 0) > 0}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}