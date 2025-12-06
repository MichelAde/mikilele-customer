'use client'

import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'

export default function CartButton() {
  const { getTotalItems, toggleCart } = useCartStore()
  const totalItems = getTotalItems()

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
      aria-label="Shopping cart"
    >
      <ShoppingCart className="w-6 h-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </button>
  )
}