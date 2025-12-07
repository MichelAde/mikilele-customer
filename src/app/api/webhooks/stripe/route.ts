import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook received')
  
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    console.error('❌ No signature')
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('✅ Event verified:', event.type)
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      console.log('📦 Session ID:', session.id)
      console.log('💰 Amount:', session.amount_total)
      console.log('👤 User ID:', session.client_reference_id)

      // Get cart items from metadata
      const cartItemsString = session.metadata?.cartItems
      console.log('🛒 Cart items string:', cartItemsString)

      if (!cartItemsString) {
        console.error('❌ No cart items in metadata')
        return NextResponse.json({ error: 'No cart items' }, { status: 400 })
      }

      const cartItems = JSON.parse(cartItemsString)
      console.log('📋 Parsed cart items:', cartItems)

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        console.error('❌ Cart items is not an array or is empty')
        return NextResponse.json({ error: 'Invalid cart items' }, { status: 400 })
      }

      // Create order
      console.log('Creating order...')
      const orderData = {
        user_id: session.client_reference_id || null,
        stripe_session_id: session.id,
        total: (session.amount_total || 0) / 100,
        currency: (session.currency?.toUpperCase() || 'CAD'),
        status: 'completed',
      }
      
      console.log('Order data:', orderData)

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) {
        console.error('❌ Order creation error:', orderError)
        throw orderError
      }

      console.log('✅ Order created:', order.id)

      // Create order items
      const orderItems = cartItems.map((item: any) => {
        const orderItem = {
          order_id: order.id,
          event_id: item.eventId,
          ticket_type_id: item.ticketId,
          quantity: item.quantity || 1,
          price_per_ticket: item.price || 0,
          ticket_name: item.ticketName || 'General Admission',
          event_title: item.eventTitle || 'Event',
          event_date: item.eventDate || new Date().toISOString(),
        }
        console.log('Order item:', orderItem)
        return orderItem
      })

      console.log('Creating order items...')
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('❌ Order items error:', itemsError)
        throw itemsError
      }

      console.log('✅ Order items created:', orderItems.length)

      // Update ticket quantities
      console.log('Updating ticket quantities...')
      for (const item of cartItems) {
        try {
          const { error: updateError } = await supabase.rpc(
            'increment_ticket_sold',
            {
              ticket_id: item.ticketId,
              quantity: item.quantity || 1,
            }
          )
          if (updateError) {
            console.error('⚠️ Ticket update warning:', updateError)
          }
        } catch (e) {
          console.error('⚠️ Failed to update ticket:', e)
        }
      }

      console.log('✅ Webhook processing complete')
      return NextResponse.json({ received: true, success: true })

    } catch (error: any) {
      console.error('❌ Webhook processing error:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json({ 
        error: 'Processing failed',
        details: error.message 
      }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}