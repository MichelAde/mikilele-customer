import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'
import AbandonedCartEmail from '@/emails/AbandonedCart'

export async function POST(request: NextRequest) {
  try {
    const { customerEmail, customerName, cartItems } = await request.json()

    console.log('Sending abandoned cart email to:', customerEmail)

    if (!customerEmail || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await sendEmail({
      to: customerEmail,
      subject: '🎫 You left tickets in your cart - Get 10% off!',
      react: AbandonedCartEmail({
        customerName: customerName || 'Valued Customer',
        cartItems: cartItems.map((item: any) => ({
          eventTitle: item.eventTitle,
          ticketName: item.ticketName,
          quantity: item.quantity,
          price: item.price,
        })),
        cartUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
        discountCode: 'COMEBACK10',
      }),
    })

    console.log('✅ Abandoned cart email sent')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to send abandoned cart email:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}