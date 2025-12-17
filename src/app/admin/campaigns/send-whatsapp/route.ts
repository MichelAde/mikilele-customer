import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { 
      campaignId, 
      stepId, 
      userId, 
      recipientPhone,
      content
    } = await request.json()

    // Send WhatsApp message via Twilio
    const message = await twilioClient.messages.create({
      body: content,
      from: process.env.TWILIO_WHATSAPP_NUMBER!, // whatsapp:+14155238886
      to: `whatsapp:${recipientPhone}`
    })

    // Track the send in database
    await supabase.from('campaign_sends').insert({
      campaign_id: campaignId,
      campaign_step_id: stepId,
      user_id: userId,
      channel: 'twilio_whatsapp',
      recipient_phone: recipientPhone,
      status: 'sent',
      sent_at: new Date().toISOString(),
      external_id: message.sid
    })

    return NextResponse.json({ 
      success: true, 
      messageId: message.sid 
    })

  } catch (error: any) {
    console.error('WhatsApp send error:', error)
    
    // Log failed send
    const { campaignId, stepId, userId, recipientPhone } = await request.json()
    await supabase.from('campaign_sends').insert({
      campaign_id: campaignId,
      campaign_step_id: stepId,
      user_id: userId,
      channel: 'twilio_whatsapp',
      recipient_phone: recipientPhone,
      status: 'failed',
      error_message: error.message,
      sent_at: new Date().toISOString()
    })

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}