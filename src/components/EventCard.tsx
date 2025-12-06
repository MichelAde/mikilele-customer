import Image from 'next/image'
import Link from 'next/link'
import { Event } from '@/lib/supabase'
import { Calendar, MapPin } from 'lucide-react'

interface EventCardProps {
  event: Event
  minPrice?: number
}

export default function EventCard({ event, minPrice }: EventCardProps) {
  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Fallback image if none provided
  const imageUrl = event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'

  return (
    <Link href={`/events/${event.slug}`}>
      <div className="group cursor-pointer rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          <Image
            src={imageUrl}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {/* Category Badge */}
          {event.category && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800 capitalize">
              {event.category.replace('_', ' ')}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {event.title}
          </h3>

          {/* Description */}
          {event.short_description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {event.short_description}
            </p>
          )}

          {/* Date & Time */}
          <div className="flex items-center text-sm text-gray-700 mb-2">
            <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
            <span className="font-medium">
              {formatDate(event.start_datetime)}
            </span>
            <span className="mx-2">•</span>
            <span>{formatTime(event.start_datetime)}</span>
          </div>

          {/* Location */}
          {event.venue_name && (
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
              <span className="line-clamp-1">
                {event.venue_name}
                {event.city && `, ${event.city}`}
              </span>
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              {minPrice !== undefined ? (
                <div className="flex items-baseline">
                  <span className="text-xs text-gray-500 mr-1">From</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${minPrice}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">CAD</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">View Details</span>
              )}
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
              Get Tickets
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}