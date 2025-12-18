import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const webhookSecret = process.env.RESEND_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('resend-signature')

    // Verify webhook signature
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')

      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const event = JSON.parse(body)
    console.log('Resend event received:', event.type)

    // Handle different email events
    switch (event.type) {
      case 'email.sent':
        await handleEmailSent(event.data)
        break

      case 'email.delivered':
        await handleEmailDelivered(event.data)
        break

      case 'email.delivery_delayed':
        await handleEmailDelayed(event.data)
        break

      case 'email.complained':
        await handleEmailComplained(event.data)
        break

      case 'email.bounced':
        await handleEmailBounced(event.data)
        break

      case 'email.opened':
        await handleEmailOpened(event.data)
        break

      case 'email.clicked':
        await handleEmailClicked(event.data)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

async function handleEmailSent(data: any) {
  try {
    await supabase
      .from('campaign_sends')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('email_id', data.email_id)

    console.log('Email sent:', data.email_id)
  } catch (error) {
    console.error('Error handling email sent:', error)
  }
}

async function handleEmailDelivered(data: any) {
  try {
    await supabase
      .from('campaign_sends')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString()
      })
      .eq('email_id', data.email_id)

    console.log('Email delivered:', data.email_id)
  } catch (error) {
    console.error('Error handling email delivered:', error)
  }
}

async function handleEmailDelayed(data: any) {
  try {
    await supabase
      .from('campaign_sends')
      .update({
        status: 'delayed'
      })
      .eq('email_id', data.email_id)

    console.log('Email delayed:', data.email_id)
  } catch (error) {
    console.error('Error handling email delayed:', error)
  }
}

async function handleEmailComplained(data: any) {
  try {
    await supabase
      .from('campaign_sends')
      .update({
        status: 'complained',
        complained_at: new Date().toISOString()
      })
      .eq('email_id', data.email_id)

    // Mark user as unsubscribed
    await supabase
      .from('users')
      .update({
        email_unsubscribed: true,
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', data.to)

    console.log('Email complained:', data.email_id)
  } catch (error) {
    console.error('Error handling email complained:', error)
  }
}

async function handleEmailBounced(data: any) {
  try {
    await supabase
      .from('campaign_sends')
      .update({
        status: 'bounced',
        bounced_at: new Date().toISOString()
      })
      .eq('email_id', data.email_id)

    // Mark email as invalid if hard bounce
    if (data.bounce_type === 'hard') {
      await supabase
        .from('users')
        .update({
          email_valid: false
        })
        .eq('email', data.to)
    }

    console.log('Email bounced:', data.email_id)
  } catch (error) {
    console.error('Error handling email bounced:', error)
  }
}

async function handleEmailOpened(data: any) {
  try {
    await supabase
      .from('campaign_sends')
      .update({
        opened: true,
        opened_at: new Date().toISOString()
      })
      .eq('email_id', data.email_id)

    console.log('Email opened:', data.email_id)
  } catch (error) {
    console.error('Error handling email opened:', error)
  }
}

async function handleEmailClicked(data: any) {
  try {
    await supabase
      .from('campaign_sends')
      .update({
        clicked: true,
        clicked_at: new Date().toISOString()
      })
      .eq('email_id', data.email_id)

    console.log('Email clicked:', data.email_id)
  } catch (error) {
    console.error('Error handling email clicked:', error)
  }
}