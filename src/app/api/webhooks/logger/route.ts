import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())

    // Log webhook for debugging
    await supabase
      .from('webhook_logs')
      .insert({
        source: headers['user-agent'] || 'unknown',
        event_type: headers['x-event-type'] || 'unknown',
        payload: body,
        headers: JSON.stringify(headers),
        received_at: new Date().toISOString()
      })

    return NextResponse.json({ logged: true })
  } catch (error: any) {
    console.error('Logger error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}