import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { to, template, data } = await request.json()

    if (!to || !template) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await sendEmail({ to, template, data })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Send notification error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}