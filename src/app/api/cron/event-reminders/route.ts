export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/resend'
import EventReminderEmail from '@/emails/EventReminder'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('🕐 Running event reminder cron job')

  try {
    // Get tomorrow's date range
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    console.log('Looking for events between:', tomorrow, 'and', dayAfterTomorrow)

    // Get all events happening tomorrow
    const { data: events, error: eventsError } = await supabaseAdmin
      .from('events')
      .select('id, title, date, start_time, location')
      .gte('date', tomorrow.toISOString())
      .lt('date', dayAfterTomorrow.toISOString())

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
      throw eventsError
    }

    console.log(`Found ${events?.length || 0} events for tomorrow`)

    if (!events || events.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No events tomorrow',
        reminders_sent: 0 
      })
    }

    let remindersSent = 0

    // For each event, get all orders with tickets
    for (const event of events) {
      console.log(`Processing event: ${event.title}`)

      // Get all order items for this event with their orders
      const { data: orderItems, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select(`
          quantity,
          ticket_name,
          order_id,
          orders!inner (
            id,
            buyer_email,
            buyer_name
          )
        `)
        .eq('event_id', event.id)

      if (itemsError) {
        console.error(`Error fetching orders for event ${event.id}:`, itemsError)
        continue
      }

      if (!orderItems || orderItems.length === 0) {
        console.log(`No orders found for event: ${event.title}`)
        continue
      }

      // Group by email (in case multiple tickets per email)
      const ordersByEmail = new Map<string, any>()
      
      for (const item of orderItems) {
        // Type assertion to handle the join result
        const order = (item as any).orders as { id: string; buyer_email: string; buyer_name: string | null }
        
        if (!order || !order.buyer_email) continue

        if (!ordersByEmail.has(order.buyer_email)) {
          ordersByEmail.set(order.buyer_email, {
            email: order.buyer_email,
            name: order.buyer_name,
            ticketCount: 0,
          })
        }

        const customer = ordersByEmail.get(order.buyer_email)!
        customer.ticketCount += item.quantity
      }

      // Send reminder to each customer
      for (const [email, customer] of ordersByEmail) {
        console.log(`Sending reminder to: ${email}`)

        try {
          await sendEmail({
            to: email,
            subject: `Tomorrow: ${event.title} - Don't forget! 🎉`,
            react: EventReminderEmail({
              customerName: customer.name || 'Valued Customer',
              eventTitle: event.title,
              eventDate: event.date,
              eventTime: event.start_time || '8:00 PM',
              location: event.location || 'See ticket for details',
              ticketCount: customer.ticketCount,
              ticketUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/my-tickets`,
            }),
          })

          remindersSent++
          console.log(`✅ Reminder sent to ${email}`)
        } catch (emailError) {
          console.error(`Failed to send reminder to ${email}:`, emailError)
        }
      }
    }

    console.log(`✅ Event reminders complete. Sent ${remindersSent} reminders.`)

    return NextResponse.json({ 
      success: true, 
      events_count: events.length,
      reminders_sent: remindersSent 
    })
  } catch (error: any) {
    console.error('❌ Event reminder cron failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}