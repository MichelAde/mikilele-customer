import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our database
export type Event = {
  id: string
  title: string
  description: string | null
  short_description: string | null
  start_datetime: string
  end_datetime: string
  cover_image_url: string | null
  category: string | null
  venue_name: string | null
  city: string | null
  province: string | null
  status: string
  slug: string
}

export type TicketType = {
  id: string
  event_id: string
  name: string
  price: number
  currency: string
  quantity_total: number
  quantity_sold: number
  is_available: boolean
}