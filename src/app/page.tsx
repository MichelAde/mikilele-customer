'use client'

import { useEffect, useState } from 'react'
import { supabase, Event } from '@/lib/supabase'
import EventCard from '@/components/EventCard'
import SearchBar from '@/components/SearchBar'
import CartButton from '@/components/CartButton'
import CartSidebar from '@/components/CartSidebar'
import AuthModal from '@/components/AuthModal'
import { useAuth } from '@/lib/auth-context'
import { Loader2, LogOut, User, Ticket } from 'lucide-react'
import Link from 'next/link'
import { Loader2, LogOut, User, Ticket } from 'lucide-react'

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [ticketPrices, setTicketPrices] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin')

  const { user, signOut } = useAuth()

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [searchQuery, selectedCategory, events])

  const fetchEvents = async () => {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true })

      if (eventsError) throw eventsError

      setEvents(eventsData || [])

      if (eventsData && eventsData.length > 0) {
        const eventIds = eventsData.map((e) => e.id)
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('ticket_types')
          .select('event_id, price')
          .in('event_id', eventIds)
          .eq('is_available', true)

        if (ticketsError) throw ticketsError

        const prices: Record<string, number> = {}
        ticketsData?.forEach((ticket) => {
          if (!prices[ticket.event_id] || ticket.price < prices[ticket.event_id]) {
            prices[ticket.event_id] = ticket.price
          }
        })
        setTicketPrices(prices)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.venue_name?.toLowerCase().includes(query) ||
          event.city?.toLowerCase().includes(query)
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((event) => event.category === selectedCategory)
    }

    setFilteredEvents(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mikilele Events
              </h1>
              <p className="text-gray-600 mt-1">
                Discover amazing events and experiences
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <Link
                href="/my-passes"
                className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                <Ticket className="w-4 h-4" />
                My Passes
              </Link>
              <Link
                href="/passes"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                <Ticket className="w-4 h-4" />
                Passes
              </Link>
              <CartButton />
              
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/my-tickets"
                    className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    <Ticket className="w-4 h-4" />
                    My Tickets
                  </Link>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthView('signin')
                      setAuthModalOpen(true)
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthView('signup')
                      setAuthModalOpen(true)
                    }}
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredEvents.length === 0 ? (
              'No events found'
            ) : (
              <>
                Showing <span className="font-semibold text-gray-900">{filteredEvents.length}</span> event
                {filteredEvents.length !== 1 ? 's' : ''}
              </>
            )}
          </p>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No events match your search criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                minPrice={ticketPrices[event.id]}
              />
            ))}
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultView={authView}
      />

      {/* Cart Sidebar */}
      <CartSidebar />

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Mikilele Events</h3>
              <p className="text-gray-400">
                Your premier destination for events, dance classes, and entertainment.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Events</a></li>
                <li><a href="#" className="hover:text-white">Dance School</a></li>
                <li><a href="#" className="hover:text-white">DJ Services</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Toronto, Ontario</li>
                <li>info@mikilele.com</li>
                <li>(416) 555-0123</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Mikilele Events. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}