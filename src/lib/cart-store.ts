import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  ticketId: string
  ticketName: string
  eventId: string
  eventTitle: string
  eventSlug: string
  eventDate: string
  price: number
  quantity: number
  maxQuantity: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (ticketId: string) => void
  updateQuantity: (ticketId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const existingItem = get().items.find((i) => i.ticketId === item.ticketId)
        
        if (existingItem) {
          // Update quantity if item already in cart
          const newQuantity = existingItem.quantity + (item.quantity || 1)
          if (newQuantity <= item.maxQuantity) {
            set({
              items: get().items.map((i) =>
                i.ticketId === item.ticketId
                  ? { ...i, quantity: newQuantity }
                  : i
              ),
            })
          }
        } else {
          // Add new item
          set({
            items: [...get().items, { ...item, quantity: item.quantity || 1 }],
          })
        }
        
        // Auto-open cart when item added
        set({ isOpen: true })
      },

      removeItem: (ticketId) => {
        set({
          items: get().items.filter((item) => item.ticketId !== ticketId),
        })
      },

      updateQuantity: (ticketId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(ticketId)
          return
        }

        set({
          items: get().items.map((item) =>
            item.ticketId === ticketId
              ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
              : item
          ),
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen })
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'mikilele-cart', // localStorage key
    }
  )
)