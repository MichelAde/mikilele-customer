import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { sendEmail } from '@/lib/resend'
import OrderConfirmationEmail from '@/emails/OrderConfirmation'
import PassConfirmationEmail from '@/emails/PassConfirmation'
import ClassPackageConfirmationEmail from '@/emails/ClassPackageConfirmation'

// Create admin client with service role
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
  console.log('🔔 Webhook received at:', new Date().toISOString())
  
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    console.error('❌ No signature')
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set')
    return NextResponse.json({ error: 'Database credentials not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    console.log('✅ Event verified:', event.type)
  } catch (err: any) {
    console.error('❌ Verification failed:', err.message)
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      console.log('📦 Processing session:', session.id)
      console.log('📋 Metadata:', JSON.stringify(session.metadata, null, 2))
      console.log('👤 Client reference:', session.client_reference_id)
      console.log('💰 Amount:', session.amount_total)

      // ==========================================
      // HANDLE CLASS PACKAGE PURCHASES
      // ==========================================
      if (session.metadata?.type === 'class_package_purchase') {
        console.log('💃 Processing CLASS PACKAGE purchase')
        
        const packageId = session.metadata.package_id
        const credits = parseInt(session.metadata.credits)
        const validityDays = session.metadata.validity_days !== 'null' 
          ? parseInt(session.metadata.validity_days) 
          : null

        console.log('Package details:', { packageId, credits, validityDays })

        let expiryDate = null
        if (validityDays) {
          const expiry = new Date()
          expiry.setDate(expiry.getDate() + validityDays)
          expiryDate = expiry.toISOString()
          console.log('Calculated expiry:', expiryDate)
        }

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

        console.log('Inserting package:', JSON.stringify(packageData, null, 2))

        const { data: studentPackage, error: packageError } = await supabaseAdmin
          .from('student_packages')
          .insert(packageData)
          .select()
          .single()

        if (packageError) {
          console.error('❌ Package creation error:', {
            message: packageError.message,
            details: packageError.details,
            hint: packageError.hint,
            code: packageError.code
          })
          throw packageError
        }

        console.log('✅ Student package created successfully:', studentPackage.id)

        // SEND EMAIL CONFIRMATION
        if (session.customer_details?.email) {
          console.log('📧 Sending class package confirmation email to:', session.customer_details.email)
          
          // Get package details
          const { data: packageDetails } = await supabaseAdmin
            .from('class_packages')
            .select('name')
            .eq('id', packageId)
            .single()
          
          await sendEmail({
            to: session.customer_details.email,
            subject: `Your ${packageDetails?.name || 'Class Package'} is Ready! 💃`,
            react: ClassPackageConfirmationEmail({
              customerName: session.customer_details.name || 'Valued Customer',
              packageName: packageDetails?.name || 'Class Package',
              creditsTotal: credits,
              expiryDate: expiryDate,
              packageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/classes/my-classes`,
            }),
          })
          
          console.log('✅ Class package confirmation email sent')
        }
        
        return NextResponse.json({
          received: true, 
          success: true, 
          type: 'class_package',
          package_id: studentPackage.id 
        })
      }
      
      // ==========================================
      // HANDLE EVENT PASS PURCHASES
      // ==========================================
      else if (session.metadata?.type === 'pass_purchase') {
        console.log('🎫 Processing PASS purchase')
        
        const passTypeId = session.metadata.pass_type_id
        const credits = parseInt(session.metadata.credits)
        const validityDays = session.metadata.validity_days !== 'null' 
          ? parseInt(session.metadata.validity_days) 
          : null

        console.log('Pass details:', { passTypeId, credits, validityDays })

        let expiryDate = null
        if (validityDays) {
          const expiry = new Date()
          expiry.setDate(expiry.getDate() + validityDays)
          expiryDate = expiry.toISOString()
          console.log('Calculated expiry:', expiryDate)
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

        console.log('Inserting pass:', JSON.stringify(passData, null, 2))

        const { data: pass, error: passError } = await supabaseAdmin
          .from('user_passes')
          .insert(passData)
          .select()
          .single()

        if (passError) {
          console.error('❌ Pass creation error:', {
            message: passError.message,
            details: passError.details,
            hint: passError.hint,
            code: passError.code
          })
          throw passError
        }

        console.log('✅ Pass created successfully:', pass.id)

        // SEND EMAIL CONFIRMATION
        if (session.customer_details?.email) {
          console.log('📧 Sending pass confirmation email to:', session.customer_details.email)
          
          // Get pass type details
          const { data: passType } = await supabaseAdmin
            .from('pass_types')
            .select('name')
            .eq('id', passTypeId)
            .single()
          
          await sendEmail({
            to: session.customer_details.email,
            subject: `Your ${passType?.name || 'Event Pass'} is Activated! 🎟️`,
            react: PassConfirmationEmail({
              customerName: session.customer_details.name || 'Valued Customer',
              passName: passType?.name || 'Event Pass',
              creditsTotal: credits,
              expiryDate: expiryDate,
              passUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/my-passes`,
            }),
          })
          
          console.log('✅ Pass confirmation email sent')
        }
        
        return NextResponse.json({
          received: true, 
          success: true, 
          type: 'pass',
          pass_id: pass.id 
        })
      } 
      
      // ==========================================
      // HANDLE REGULAR TICKET PURCHASES
      // ==========================================
      else if (session.metadata?.type === 'ticket_purchase' || !session.metadata?.type) {
        console.log('🎟️ Processing TICKET purchase')
        
        const cartItemsString = session.metadata?.cartItems
        if (!cartItemsString) {
          console.error('❌ No cart items for ticket purchase')
          return NextResponse.json({ error: 'No cart items' }, { status: 400 })
        }

        const cartItems = JSON.parse(cartItemsString)
        console.log('Cart items:', JSON.stringify(cartItems, null, 2))

        if (!Array.isArray(cartItems) || cartItems.length === 0) {
          console.error('❌ Invalid cart items')
          return NextResponse.json({ error: 'Invalid cart items' }, { status: 400 })
        }

        // OPTION 1: Validate user exists, use NULL if not found or not provided
        let validUserId = null
        
        if (session.client_reference_id) {
          console.log('🔍 Checking if user exists:', session.client_reference_id)
          
          try {
            const { data: userExists, error: userCheckError } = await supabaseAdmin
              .auth.admin.getUserById(session.client_reference_id)
            
            if (userExists && !userCheckError) {
              validUserId = session.client_reference_id
              console.log('✅ Valid user ID confirmed:', validUserId)
            } else {
              console.log('⚠️ User ID not found in auth.users, creating guest order')
              console.log('User check error:', userCheckError)
            }
          } catch (e: any) {
            console.log('⚠️ Error checking user existence:', e.message)
            console.log('Creating guest order instead')
          }
        } else {
          console.log('⚠️ No user ID provided, creating guest order')
        }

        const orderData = {
          user_id: validUserId, // Will be NULL for guest orders or invalid user IDs
          stripe_session_id: session.id,
          buyer_email: session.customer_details?.email || session.customer_email || null,
          buyer_name: session.customer_details?.name || null,
          subtotal: (session.amount_subtotal || session.amount_total || 0) / 100,
          total: (session.amount_total || 0) / 100,
          currency: (session.currency?.toUpperCase() || 'CAD'),
          status: 'completed',
        }
        
        console.log('Creating order:', JSON.stringify(orderData, null, 2))

        const { data: order, error: orderError } = await supabaseAdmin
          .from('orders')
          .insert(orderData)
          .select()
          .single()

        if (orderError) {
          console.error('❌ Order error:', {
            message: orderError.message,
            details: orderError.details,
            hint: orderError.hint,
            code: orderError.code
          })
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

        console.log('Creating order items:', JSON.stringify(orderItems, null, 2))

        const { error: itemsError } = await supabaseAdmin
          .from('order_items')
          .insert(orderItems)

        if (itemsError) {
          console.error('❌ Items error:', {
            message: itemsError.message,
            details: itemsError.details,
            hint: itemsError.hint,
            code: itemsError.code
          })
          throw itemsError
        }

        console.log('✅ Items created:', orderItems.length)

        // Update ticket quantities
        for (const item of cartItems) {
          try {
            console.log('Updating ticket quantity for:', item.ticketId)
            const { error: rpcError } = await supabaseAdmin.rpc('increment_ticket_sold', {
              ticket_id: item.ticketId,
              quantity: item.quantity || 1,
            })
            if (rpcError) {
              console.error('⚠️ Ticket update failed:', rpcError)
            } else {
              console.log('✅ Ticket quantity updated')
            }
          } catch (e: any) {
            console.error('⚠️ Ticket update exception:', e.message)
          }
        }

        console.log('✅ Ticket purchase complete')

        // SEND EMAIL CONFIRMATION
        if (session.customer_details?.email) {
          console.log('📧 Sending order confirmation email to:', session.customer_details.email)
          
          await sendEmail({
            to: session.customer_details.email,
            subject: `Order Confirmation - Mikilele Events 🎉`,
            react: OrderConfirmationEmail({
              customerName: session.customer_details.name || 'Valued Customer',
              orderNumber: order.id.substring(0, 8).toUpperCase(),
              orderItems: cartItems.map((item: any) => ({
                eventTitle: item.eventTitle,
                eventDate: item.eventDate,
                ticketName: item.ticketName,
                quantity: item.quantity,
                price: item.price,
              })),
              total: (session.amount_total || 0) / 100,
              orderUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/my-tickets`,
            }),
          })
          
          console.log('✅ Order confirmation email sent')
        }
        
        return NextResponse.json({
          received: true, 
          success: true, 
          type: 'ticket',
          order_id: order.id,
          guest_order: validUserId === null 
        })
      }

      // Unknown type
      else {
        console.log('⚠️ Unknown purchase type:', session.metadata?.type)
        return NextResponse.json({ 
          received: true,
          warning: 'Unknown purchase type' 
        })
      }

    } catch (error: any) {
      console.error('❌ Processing failed:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        stack: error.stack
      })
      return NextResponse.json({ 
        error: 'Processing failed',
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 })
    }
  }

  console.log('ℹ️ Event type not handled:', event.type)
  return NextResponse.json({ received: true })
}