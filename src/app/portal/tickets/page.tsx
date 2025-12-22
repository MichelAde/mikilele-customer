'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Calendar, MapPin, Ticket, Download, QrCode } from 'lucide-react'

interface TicketData {
  id: string
  order_id: string
  event_id: string
  ticket_type: string
  quantity: number
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
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  )

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          events (
            title,
            start_datetime,
            venue_name,
            address,
            city,
            province
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tickets:', error)
      } else {
        setTickets(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const upcomingTickets = tickets.filter(ticket => {
    const eventDate = new Date(ticket.events?.start_datetime)
    return eventDate >= new Date()
  })

  const pastTickets = tickets.filter(ticket => {
    const eventDate = new Date(ticket.events?.start_datetime)
    return eventDate < new Date()
  })

  const displayTickets = activeTab === 'upcoming' ? upcomingTickets : pastTickets

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
        <p className="text-gray-600">View and manage your event tickets</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'upcoming'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming ({upcomingTickets.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'past'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Past ({pastTickets.length})
        </button>
      </div>

      {displayTickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {activeTab === 'upcoming' ? 'No upcoming tickets' : 'No past tickets'}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'upcoming' 
              ? 'You have not purchased any tickets yet.' 
              : 'You do not have any past tickets.'}
          </p>
          <a
            href="/"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            Browse Events
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {displayTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {ticket.events?.title || 'Event'}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(ticket.events?.start_datetime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {ticket.events?.venue_name || 'Venue TBD'}
                        {ticket.events?.city && `, ${ticket.events.city}`}
                        {ticket.events?.province && `, ${ticket.events.province}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Ticket className="w-4 h-4" />
                      <span>
                        {ticket.ticket_type} - Qty: {ticket.quantity} - ${ticket.price?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ticket.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ticket.status || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm">
                    <QrCode className="w-4 h-4" />
                    View QR
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}