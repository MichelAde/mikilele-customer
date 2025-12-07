import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      // Get cart items from metadata
      const cartItems = JSON.parse(session.metadata?.cartItems || '[]')

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.client_reference_id || null,
          stripe_session_id: session.id,
          total_amount: (session.amount_total || 0) / 100,
          currency: session.currency?.toUpperCase(),
          status: 'completed',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        event_id: item.eventId,
        ticket_type_id: item.ticketId,
        quantity: item.quantity,
        price_per_ticket: item.price || 0,
        ticket_name: item.ticketName || '',
        event_title: item.eventTitle || '',
        event_date: item.eventDate || new Date().toISOString(),
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Update ticket quantities
      for (const item of cartItems) {
        const { error: updateError } = await supabase.rpc(
          'increment_ticket_sold',
          {
            ticket_id: item.ticketId,
            quantity: item.quantity,
          }
        )
        if (updateError) console.error('Error updating ticket quantity:', updateError)
      }

      console.log('Order created:', order.id)
    } catch (error) {
      console.error('Error processing webhook:', error)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}