'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'

interface TicketSelectorProps {
  ticketId: string
  ticketName: string
  ticketDescription?: string
  eventId: string
  eventTitle: string
  eventSlug: string
  eventDate: string
  price: number
  currency: string
  available: number
  quantityTotal: number
}

export default function TicketSelector({
  ticketId,
  ticketName,
  ticketDescription,
  eventId,
  eventTitle,
  eventSlug,
  eventDate,
  price,
  currency,
  available,
  quantityTotal,
}: TicketSelectorProps) {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)
  
  const soldOut = available <= 0
  const maxQuantity = Math.min(available, 10) // Max 10 tickets per type

  const handleAddToCart = () => {
    addItem({
      ticketId,
      ticketName,
      eventId,
      eventTitle,
      eventSlug,
      eventDate,
      price,
      quantity,
      maxQuantity: available,
    })
    setQuantity(1) // Reset quantity after adding
  }

  if (soldOut) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{ticketName}</h3>
            {ticketDescription && (
              <p className="text-sm text-gray-600 mt-1">{ticketDescription}</p>
            )}
          </div>
          <div className="text-right ml-4">
            <p className="text-2xl font-bold text-gray-400">${price}</p>
            <p className="text-xs text-gray-500">{currency}</p>
          </div>
        </div>
        <div className="mt-3">
          <span className="text-red-600 font-medium">Sold Out</span>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{ticketName}</h3>
          {ticketDescription && (
            <p className="text-sm text-gray-600 mt-1">{ticketDescription}</p>
          )}
        </div>
        <div className="text-right ml-4">
          <p className="text-2xl font-bold text-gray-900">${price}</p>
          <p className="text-xs text-gray-500">{currency}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {available} of {quantityTotal} available
        </p>
      </div>

      {/* Quantity Selector */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 hover:bg-gray-100 transition-colors"
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            className="px-3 py-2 hover:bg-gray-100 transition-colors"
            disabled={quantity >= maxQuantity}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  )
}