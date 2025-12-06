import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Calendar, MapPin, Clock, Users, ArrowLeft, Tag } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params

  // Fetch event details
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (eventError || !event) {
    notFound()
  }

  // Fetch ticket types for this event
  const { data: tickets } = await supabase
    .from('ticket_types')
    .select('*')
    .eq('event_id', event.id)
    .eq('is_available', true)
    .order('sort_order', { ascending: true })

  // Format date and time
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

  const imageUrl = event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'

  // Calculate available tickets
  const totalAvailable = tickets?.reduce((sum, ticket) => {
    return sum + (ticket.quantity_total - ticket.quantity_sold)
  }, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Mikilele Events</h1>
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
            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {event.title}
            </h1>

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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get Tickets</h2>

              {tickets && tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => {
                    const available = ticket.quantity_total - ticket.quantity_sold
                    const soldOut = available <= 0

                    return (
                      <div
                        key={ticket.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{ticket.name}</h3>
                            {ticket.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {ticket.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-2xl font-bold text-gray-900">
                              ${ticket.price}
                            </p>
                            <p className="text-xs text-gray-500">{ticket.currency}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <p className="text-sm text-gray-600">
                            {soldOut ? (
                              <span className="text-red-600 font-medium">Sold Out</span>
                            ) : (
                              <span>
                                {available} of {ticket.quantity_total} available
                              </span>
                            )}
                          </p>
                          <button
                            disabled={soldOut}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                              soldOut
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {soldOut ? 'Sold Out' : 'Select'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-600">No tickets available at this time.</p>
              )}

              {/* Add to Calendar */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Clock className="w-5 h-5 mr-2" />
                  Add to Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

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