import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .limit(10)

    if (error) throw error

    return NextResponse.json({
      success: true,
      events: events || []
    })
  } catch (error: any) {
    console.error('Error fetching events:', error)
    return NextResponse.json({
      success: true,
      events: []
    })
  }
}