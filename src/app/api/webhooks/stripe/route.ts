import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

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
    console.error('❌ Verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      console.log('📦 Processing session:', session.id)
      console.log('📋 Metadata:', session.metadata)

      // Handle CLASS PACKAGE purchases
      if (session.metadata?.type === 'class_package_purchase') {
        console.log('💃 Processing CLASS PACKAGE purchase')
        
        const packageId = session.metadata.package_id
        const credits = parseInt(session.metadata.credits)
        const validityDays = session.metadata.validity_days !== 'null' 
          ? parseInt(session.metadata.validity_days) 
          : null

        // Calculate expiry date
        let expiryDate = null
        if (validityDays) {
          const expiry = new Date()
          expiry.setDate(expiry.getDate() + validityDays)
          expiryDate = expiry.toISOString()
        }

        // Create student package
        const packageData = {
          user_id: session.client_reference_id,
          package_id: packageId,
          credits_remaining: credits,
          credits_total: credits,
          purchase_date: new Date().toISOString(),
          expiry_date: expiryDate,
          status: 'active',
          stripe_session_id: session.id,
          amount_paid: (session.amount_total || 0) / 100,
        }

        console.log('Creating student package:', packageData)

        const { data: studentPackage, error: packageError } = await supabaseAdmin
          .from('student_packages')
          .insert(packageData)
          .select()
          .single()

        if (packageError) {
          console.error('❌ Package creation error:', packageError)
          throw packageError
        }

        console.log('✅ Student package created:', studentPackage.id)
        return NextResponse.json({ received: true, success: true, type: 'class_package' })
      }
      
      // Handle EVENT PASS purchases
      else if (session.metadata?.type === 'pass_purchase') {
        console.log('🎫 Processing PASS purchase')
        
        const passTypeId = session.metadata.pass_type_id
        const credits = parseInt(session.metadata.credits)
        const validityDays = session.metadata.validity_days !== 'null' 
          ? parseInt(session.metadata.validity_days) 
          : null

        let expiryDate = null
        if (validityDays) {
          const expiry = new Date()
          expiry.setDate(expiry.getDate() + validityDays)
          expiryDate = expiry.toISOString()
        }

        const passData = {
          user_id: session.client_reference_id,
          pass_type_id: passTypeId,
          credits_remaining: credits,
          credits_total: credits,
          purchase_date: new Date().toISOString(),
          expiry_date: expiryDate,
          status: 'active',
          stripe_session_id: session.id,
          amount_paid: (session.amount_total || 0) / 100,
        }

        console.log('Creating pass:', passData)

        const { data: pass, error: passError } = await supabaseAdmin
          .from('user_passes')
          .insert(passData)
          .select()
          .single()

        if (passError) {
          console.error('❌ Pass creation error:', passError)
          throw passError
        }

        console.log('✅ Pass created:', pass.id)
        return NextResponse.json({ received: true, success: true, type: 'pass' })
      } 
      
      // Handle regular TICKET purchases
      else {
        console.log('🎟️ Processing TICKET purchase')
        
        const cartItemsString = session.metadata?.cartItems
        if (!cartItemsString) {
          console.error('❌ No cart items for ticket purchase')
          return NextResponse.json({ error: 'No cart items' }, { status: 400 })
        }

        const cartItems = JSON.parse(cartItemsString)
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
          console.error('❌ Invalid cart items')
          return NextResponse.json({ error: 'Invalid cart items' }, { status: 400 })
        }

        const orderData = {
          user_id: session.client_reference_id || null,
          stripe_session_id: session.id,
          buyer_email: session.customer_details?.email || session.customer_email || null,
          buyer_name: session.customer_details?.name || null,
          total: (session.amount_total || 0) / 100,
          currency: (session.currency?.toUpperCase() || 'CAD'),
          status: 'completed',
        }
        
        console.log('Creating order:', orderData)

        const { data: order, error: orderError } = await supabaseAdmin
          .from('orders')
          .insert(orderData)
          .select()
          .single()

        if (orderError) {
          console.error('❌ Order error:', orderError)
          throw orderError
        }

        console.log('✅ Order created:', order.id)

        const orderItems = cartItems.map((item: any) => ({
          order_id: order.id,
          event_id: item.eventId,
          ticket_type_id: item.ticketId,
          quantity: item.quantity || 1,
          price_per_ticket: item.price || 0,
          ticket_name: item.ticketName || 'General Admission',
          event_title: item.eventTitle || 'Event',
          event_date: item.eventDate || new Date().toISOString(),
        }))

        const { error: itemsError } = await supabaseAdmin
          .from('order_items')
          .insert(orderItems)

        if (itemsError) {
          console.error('❌ Items error:', itemsError)
          throw itemsError
        }

        console.log('✅ Items created:', orderItems.length)

        for (const item of cartItems) {
          try {
            await supabaseAdmin.rpc('increment_ticket_sold', {
              ticket_id: item.ticketId,
              quantity: item.quantity || 1,
            })
          } catch (e) {
            console.error('⚠️ Ticket update failed:', e)
          }
        }

        console.log('✅ Ticket purchase complete')
        return NextResponse.json({ received: true, success: true, type: 'ticket' })
      }

    } catch (error: any) {
      console.error('❌ Processing failed:', error)
      return NextResponse.json({ 
        error: 'Processing failed',
        details: error.message,
        hint: error.hint 
      }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}