import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)

    console.log('Twilio webhook received:', data.MessageStatus)

    const messageId = data.MessageSid as string
    const status = data.MessageStatus as string

    // Update campaign send status
    await supabase
      .from('campaign_sends')
      .update({
        status: mapTwilioStatus(status),
        delivered_at: status === 'delivered' ? new Date().toISOString() : null
      })
      .eq('message_id', messageId)

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

function mapTwilioStatus(twilioStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'queued': 'queued',
    'sending': 'sending',
    'sent': 'sent',
    'delivered': 'delivered',
    'undelivered': 'failed',
    'failed': 'failed'
  }
  return statusMap[twilioStatus] || 'unknown'
}