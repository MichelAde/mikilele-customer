'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Ticket,
  Calendar,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface TicketType {
  id: string
  event_id: string
  name: string
  description: string
  price: number
  quantity_available: number
  quantity_sold: number
  sale_start_date: string | null
  sale_end_date: string | null
  is_active: boolean
  max_per_order: number | null
  min_per_order: number | null
  created_at: string
  events?: {
    title: string
    start_datetime: string
  }
}

export default function TicketTypesManagement() {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTicketType, setEditingTicketType] = useState<TicketType | null>(null)

  useEffect(() => {
    fetchTicketTypes()
  }, [])

  async function fetchTicketTypes() {
    setLoading(true)
    try {
      const response = await fetch('/api/events/ticket-types')
      const data = await response.json()

      if (data.success) {
        setTicketTypes(data.ticketTypes)
      }
    } catch (error) {
      console.error('Error fetching ticket types:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteTicketType(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const response = await fetch(`/api/events/ticket-types?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        alert('Ticket type deleted successfully!')
        fetchTicketTypes()
      } else {
        alert(data.error || 'Failed to delete ticket type')
      }
    } catch (error) {
      console.error('Error deleting ticket type:', error)
      alert('Failed to delete ticket type')
    }
  }

  async function toggleActive(ticketType: TicketType) {
    try {
      const response = await fetch('/api/events/ticket-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ticketType.id,
          is_active: !ticketType.is_active
        })
      })

      const data = await response.json()

      if (data.success) {
        fetchTicketTypes()
      }
    } catch (error) {
      console.error('Error toggling active status:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket types...</p>
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
            <h1 className="text-3xl font-bold mb-2">Ticket Type Management</h1>
            <p className="text-gray-600">Create and manage ticket types for your events</p>
          </div>
          <Link
            href="/admin/events/ticket-types/create"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Ticket Type
          </Link>
        </div>

        {/* Ticket Types List */}
        {ticketTypes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Ticket className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No ticket types yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first ticket type to start selling event tickets
            </p>
            <Link
              href="/admin/events/ticket-types/create"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              Create Your First Ticket Type
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {ticketTypes.map((ticketType) => {
              const percentageSold = ticketType.quantity_available > 0 
                ? (ticketType.quantity_sold / ticketType.quantity_available) * 100 
                : 0
              const remaining = ticketType.quantity_available - ticketType.quantity_sold
              const isOnSale = ticketType.is_active && 
                (!ticketType.sale_end_date || new Date(ticketType.sale_end_date) > new Date())

              return (
                <div
                  key={ticketType.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${
                        isOnSale ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Ticket className={`w-6 h-6 ${
                          isOnSale ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{ticketType.name}</h3>
                          {isOnSale ? (
                            <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              ON SALE
                            </span>
                          ) : (
                            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-800 font-semibold flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              INACTIVE
                            </span>
                          )}
                        </div>

                        {ticketType.events && (
                          <div className="text-sm text-gray-600 mb-3">
                            Event: {ticketType.events.title}
                          </div>
                        )}

                        {ticketType.description && (
                          <p className="text-gray-600 text-sm mb-3">{ticketType.description}</p>
                        )}

                        {/* Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <div>
                              <div className="text-xs text-gray-500">Price</div>
                              <div className="font-semibold">${ticketType.price.toFixed(2)}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="text-xs text-gray-500">Sold</div>
                              <div className="font-semibold">
                                {ticketType.quantity_sold} / {ticketType.quantity_available}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                            <div>
                              <div className="text-xs text-gray-500">Remaining</div>
                              <div className="font-semibold">{remaining}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <div>
                              <div className="text-xs text-gray-500">% Sold</div>
                              <div className="font-semibold">{percentageSold.toFixed(0)}%</div>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div 
                            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentageSold}%` }}
                          ></div>
                        </div>

                        {/* Sale Dates */}
                        {(ticketType.sale_start_date || ticketType.sale_end_date) && (
                          <div className="flex gap-4 text-xs text-gray-500">
                            {ticketType.sale_start_date && (
                              <div>
                                <span className="font-medium">Sale starts:</span> {new Date(ticketType.sale_start_date).toLocaleDateString()}
                              </div>
                            )}
                            {ticketType.sale_end_date && (
                              <div>
                                <span className="font-medium">Sale ends:</span> {new Date(ticketType.sale_end_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleActive(ticketType)}
                        className={`p-2 rounded-lg transition ${
                          ticketType.is_active 
                            ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' 
                            : 'bg-green-100 hover:bg-green-200 text-green-700'
                        }`}
                        title={ticketType.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {ticketType.is_active ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </button>

                      <Link
                        href={`/admin/events/ticket-types/${ticketType.id}/edit`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title="Edit ticket type"
                      >
                        <Edit className="w-5 h-5 text-gray-600" />
                      </Link>

                      <button
                        onClick={() => deleteTicketType(ticketType.id, ticketType.name)}
                        className="p-2 hover:bg-red-100 rounded-lg transition"
                        title="Delete ticket type"
                        disabled={ticketType.quantity_sold > 0}
                      >
                        <Trash2 className={`w-5 h-5 ${
                          ticketType.quantity_sold > 0 ? 'text-gray-400' : 'text-red-600'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}