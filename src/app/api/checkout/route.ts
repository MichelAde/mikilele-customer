import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items } = body

    console.log('Checkout request received:', { itemCount: items?.length })

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY')
      return NextResponse.json({ error: 'Payment system configuration error' }, { status: 500 })
    }

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.error('Missing NEXT_PUBLIC_BASE_URL')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'cad',
        product_data: {
          name: `${item.eventTitle} - ${item.ticketName}`,
          description: new Date(item.eventDate).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    console.log('Creating Stripe session...')

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      client_reference_id: items[0]?.userId || null,  
      metadata: {
        cartItems: JSON.stringify(items.map((item: any) => ({
          ticketId: item.ticketId,
          ticketName: item.ticketName,          
          eventId: item.eventId,
          eventTitle: item.eventTitle,          
          eventDate: item.eventDate,            
          quantity: item.quantity,
          price: item.price,                     
        }))),
      },
    })

    console.log('Stripe session created:', session.id)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    )
  }
}