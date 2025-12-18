'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { ArrowLeft, Ticket, Calendar, MapPin, Download } from 'lucide-react'

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    const { data } = await supabase
      .from('tickets')
      .select(`
        *,
        events (
          name,
          date,
          location,
          description
        ),
        ticket_types (
          name,
          price
        )
      `)
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false })

    setTickets(data || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">My Tickets</h1>

        {tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tickets yet</h3>
            <p className="text-gray-600 mb-6">Browse upcoming events</p>
            <Link
              href="/events"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {ticket.events?.name}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(ticket.events?.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      {ticket.events?.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{ticket.events.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold">
                        {ticket.ticket_types?.name}
                      </span>
                      <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                        ${ticket.ticket_types?.price}
                      </span>
                    </div>
                  </div>

                  <div className="ml-4">
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
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
    </div>
  )
}