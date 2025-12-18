import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get pending emails
    const { data: emails, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(50)

    if (error) throw error

    let sent = 0
    let failed = 0

    // Process each email
    for (const email of emails || []) {
      try {
        const result = await sendEmail({
          to: email.to_email,
          template: email.template as any,
          data: email.data
        })

        if (result.success) {
          await supabase
            .from('email_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', email.id)
          sent++
        } else {
          await supabase
            .from('email_queue')
            .update({
              status: 'failed',
              error: result.error
            })
            .eq('id', email.id)
          failed++
        }
      } catch (error: any) {
        await supabase
          .from('email_queue')
          .update({
            status: 'failed',
            error: error.message
          })
          .eq('id', email.id)
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      processed: emails?.length || 0,
      sent,
      failed
    })
  } catch (error: any) {
    console.error('Email processor error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}