import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()

    console.log('Checkout request received')
    console.log('Items:', JSON.stringify(items, null, 2))

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Invalid items:', items)
      return NextResponse.json(
        { error: 'Invalid cart items' },
        { status: 400 }
      )
    }

    // Validate required fields
    for (const item of items) {
      if (!item.eventId || !item.ticketId || !item.quantity || !item.price) {
        console.error('Missing required fields in item:', item)
        return NextResponse.json(
          { error: 'Missing required fields in cart items' },
          { status: 400 }
        )
      }
    }

    // Calculate line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'cad',
        product_data: {
          name: item.ticketName || 'Event Ticket',
          description: `${item.eventTitle || 'Event'} - ${
            new Date(item.eventDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          }`,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    console.log('Line items created:', JSON.stringify(lineItems, null, 2))

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      client_reference_id: items[0]?.userId || null,
      customer_email: items[0]?.userEmail || undefined,
      metadata: {
        type: 'ticket_purchase',
        cartItems: JSON.stringify(
          items.map((item: any) => ({
            ticketId: item.ticketId,
            ticketName: item.ticketName,
            eventId: item.eventId,
            eventTitle: item.eventTitle,
            eventDate: item.eventDate,
            quantity: item.quantity,
            price: item.price,
          }))
        ),
      },
    })

    console.log('Stripe session created:', session.id)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}