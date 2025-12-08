import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { packageId, userId } = await request.json()

    console.log('Class package checkout:', { packageId, userId })

    if (!packageId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get package details
    const { data: pkg, error: pkgError } = await supabase
      .from('class_packages')
      .select('*')
      .eq('id', packageId)
      .single()

    if (pkgError || !pkg) {
      console.error('Package not found:', pkgError)
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    console.log('Creating Stripe session for package:', pkg.name)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: pkg.currency.toLowerCase(),
            product_data: {
              name: pkg.name,
              description: pkg.description || `${pkg.credits} dance class credits`,
            },
            unit_amount: Math.round(pkg.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/classes/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/classes/packages`,
      client_reference_id: userId,
      metadata: {
        type: 'class_package_purchase',
        package_id: packageId,
        credits: pkg.credits.toString(),
        validity_days: pkg.validity_days?.toString() || 'null',
      },
    })

    console.log('Stripe session created:', session.id)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Class package checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    )
  }
}