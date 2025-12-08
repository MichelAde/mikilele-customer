import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { passTypeId, userId } = await request.json()

    console.log('Pass checkout:', { passTypeId, userId })

    if (!passTypeId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get pass type details
    const { data: passType, error: passError } = await supabase
      .from('pass_types')
      .select('*')
      .eq('id', passTypeId)
      .single()

    if (passError || !passType) {
      console.error('Pass type not found:', passError)
      return NextResponse.json(
        { error: 'Pass type not found' },
        { status: 404 }
      )
    }

    console.log('Creating Stripe session for pass:', passType.name)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: passType.currency.toLowerCase(),
            product_data: {
              name: passType.name,
              description: passType.description || `${passType.credits} event credits`,
            },
            unit_amount: Math.round(passType.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/passes/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/passes`,
      client_reference_id: userId,
      metadata: {
        type: 'pass_purchase',
        pass_type_id: passTypeId,
        credits: passType.credits.toString(),
        validity_days: passType.validity_days?.toString() || 'null',
      },
    })

    console.log('Stripe session created:', session.id)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Pass checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    )
  }
}