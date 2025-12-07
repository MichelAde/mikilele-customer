'use client'

import { useEffect, useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Calendar, MapPin, Users, ArrowLeft, Tag, Loader2, LogOut, User as UserIcon } from 'lucide-react'
import TicketSelector from '@/components/TicketSelector'
import CartButton from '@/components/CartButton'
import CartSidebar from '@/components/CartSidebar'
import AuthModal from '@/components/AuthModal'
import { useAuth } from '@/lib/auth-context'
import ShareButton from '@/components/ShareButton'

export default function EventDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, signOut } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  
  const [event, setEvent] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvent()
  }, [slug])

  const fetchEvent = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (eventError || !eventData) {
        notFound()
      }

      setEvent(eventData)

      const { data: ticketsData } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', eventData.id)
        .eq('is_available', true)
        .order('sort_order', { ascending: true })

      setTickets(ticketsData || [])
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    notFound()
  }

  const imageUrl = event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'

  const totalAvailable = tickets?.reduce((sum, ticket) => {
    return sum + (ticket.quantity_total - ticket.quantity_sold)
  }, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href="/"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Mikilele Events</h1>
            </div>
            <div className="flex items-center gap-4">
              <CartButton />
              
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <UserIcon className="w-4 h-4 text-gray-600" />
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
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Image */}
        <div className="relative h-96 w-full rounded-2xl overflow-hidden mb-8">
          <Image
            src={imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          {event.category && (
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-800 capitalize">
              {event.category.replace('_', ' ')}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-4xl font-bold text-gray-900 flex-1">
                {event.title}
              </h1>
              <ShareButton
                url={`/events/${event.slug}`}
                title={event.title}
                description={event.description?.slice(0, 160) || ''}
              />
            </div>

            {/* Event Details */}
            <div className="space-y-4 mb-8">
              {/* Date & Time */}
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-indigo-600 mr-3 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {formatDate(event.start_datetime)}
                  </p>
                  <p className="text-gray-600">
                    {formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}
                  </p>
                </div>
              </div>

              {/* Location */}
              {event.venue_name && (
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-indigo-600 mr-3 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">{event.venue_name}</p>
                    {event.address && <p className="text-gray-600">{event.address}</p>}
                    {event.city && event.province && (
                      <p className="text-gray-600">
                        {event.city}, {event.province}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Capacity */}
              <div className="flex items-start">
                <Users className="w-5 h-5 text-indigo-600 mr-3 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Capacity</p>
                  <p className="text-gray-600">
                    {totalAvailable} tickets available of {event.max_capacity} total
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-indigo-600" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Tickets */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Tickets</h2>

              {tickets && tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => {
                    const available = ticket.quantity_total - ticket.quantity_sold

                    return (
                      <TicketSelector
                        key={ticket.id}
                        ticketId={ticket.id}
                        ticketName={ticket.name}
                        ticketDescription={ticket.description}
                        eventId={event.id}
                        eventTitle={event.title}
                        eventSlug={event.slug}
                        eventDate={event.start_datetime}
                        price={ticket.price}
                        currency={ticket.currency}
                        available={available}
                        quantityTotal={ticket.quantity_total}
                      />
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-600">No tickets available at this time.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultView="signin"
      />

      {/* Cart Sidebar */}
      <CartSidebar />

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 Mikilele Events. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}