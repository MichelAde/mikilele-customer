import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting queue processing...')

    // Get all pending sends that should be sent now
    const now = new Date().toISOString()
    
    const { data: pendingSends, error: fetchError } = await supabase
      .from('campaign_sends')
      .select(`
        *,
        campaign_steps (
          subject_line,
          content,
          cta_text,
          cta_url,
          channel
        ),
        campaigns (
          name,
          status
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_send_time', now)
      .limit(100) // Process in batches

    if (fetchError) throw fetchError

    console.log(`Found ${pendingSends?.length || 0} pending sends`)

    let processedCount = 0
    let failedCount = 0

    // Process each pending send
    for (const send of pendingSends || []) {
      try {
        // Skip if campaign is not active
        if (send.campaigns?.status !== 'active') {
          await supabase
            .from('campaign_sends')
            .update({ 
              status: 'cancelled',
              error_message: 'Campaign is no longer active'
            })
            .eq('id', send.id)
          continue
        }

        const step = send.campaign_steps

        // Send based on channel
        if (step.channel === 'resend_email' && send.recipient_email) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/campaigns/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaignId: send.campaign_id,
              stepId: send.campaign_step_id,
              userId: send.user_id,
              recipientEmail: send.recipient_email,
              recipientName: 'Valued Customer',
              subject: step.subject_line,
              content: step.content,
              ctaText: step.cta_text,
              ctaUrl: step.cta_url
            })
          })

          if (response.ok) {
            processedCount++
          } else {
            failedCount++
          }
        } else if (step.channel === 'twilio_sms' && send.recipient_phone) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/campaigns/send-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaignId: send.campaign_id,
              stepId: send.campaign_step_id,
              userId: send.user_id,
              recipientPhone: send.recipient_phone,
              content: step.content
            })
          })

          if (response.ok) {
            processedCount++
          } else {
            failedCount++
          }
        } else if (step.channel === 'twilio_whatsapp' && send.recipient_phone) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/campaigns/send-whatsapp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaignId: send.campaign_id,
              stepId: send.campaign_step_id,
              userId: send.user_id,
              recipientPhone: send.recipient_phone,
              content: step.content
            })
          })

          if (response.ok) {
            processedCount++
          } else {
            failedCount++
          }
        }

      } catch (error: any) {
        console.error(`Error processing send ${send.id}:`, error)
        
        await supabase
          .from('campaign_sends')
          .update({ 
            status: 'failed',
            error_message: error.message 
          })
          .eq('id', send.id)
        
        failedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Queue processed',
      stats: {
        total: pendingSends?.length || 0,
        processed: processedCount,
        failed: failedCount
      }
    })

  } catch (error: any) {
    console.error('Queue processing error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}