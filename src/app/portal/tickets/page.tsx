'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Ticket, Calendar, MapPin, Clock, Download, QrCode } from 'lucide-react'

interface TicketData {
  id: string
  order_id: string
  event_id: string
  ticket_type: string
  price: number
  status: string
  created_at: string
  events: {
    title: string
    start_datetime: string
    venue_name: string
    address: string
    city: string
    province: string
  }
}

export default function MyTicketsPage() {
  const [upcomingTickets, setUpcomingTickets] = useState<TicketData[]>([])
  const [pastTickets, setPastTickets] = useState<TicketData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch all orders with items and events
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            events (
              title,
              start_datetime,
              venue_name,
              address,
              city,
              province
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })

      if (!orders) return

      const now = new Date().toISOString()
      const upcoming: TicketData[] = []
      const past: TicketData[] = []

      orders.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const ticket = {
            id: item.id,
            order_id: order.id,
            event_id: item.event_id,
            ticket_type: item.ticket_type_name || 'General Admission',
            price: parseFloat(item.price),
            status: order.status,
            created_at: order.created_at,
            events: item.events
          }

          if (item.events?.start_datetime > now) {
            upcoming.push(ticket)
          } else {
            past.push(ticket)
          }
        })
      })

      setUpcomingTickets(upcoming)
      setPastTickets(past)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const tickets = activeTab === 'upcoming' ? upcomingTickets : pastTickets

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
        <p className="text-gray-600">View and manage your event tickets</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === 'upcoming'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming ({upcomingTickets.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === 'past'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Past ({pastTickets.length})
        </button>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeTab === 'upcoming' ? 'No upcoming events' : 'No past events'}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'upcoming' 
              ? 'Browse events and get your tickets'
              : 'Your past event tickets will appear here'}
          </p>
          {activeTab === 'upcoming' && (
            <a
              href="/events"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Browse Events
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
              <div className="flex">
                {/* Left side - Event Info */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {ticket.events.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                      </p>
                    </div>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {ticket.ticket_type}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar className="w-5 h-5" />
                      <span>{formatDate(ticket.events.start_datetime)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Clock className="w-5 h-5" />
                      <span>{formatTime(ticket.events.start_datetime)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      <span>
                        {ticket.events.venue_name}, {ticket.events.city}, {ticket.events.province}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                      <QrCode className="w-4 h-4" />
                      View QR Code
                    </button>
                    <button className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>

                {/* Right side - Price */}
                <div className="w-32 bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 flex flex-col items-center justify-center">
                  <p className="text-sm opacity-90 mb-1">Paid</p>
                  <p className="text-3xl font-bold">${ticket.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}