import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { 
      campaignId, 
      stepId, 
      userId, 
      recipientEmail, 
      recipientName,
      subject, 
      content,
      ctaText,
      ctaUrl
    } = await request.json()

    // Build HTML email with content and CTA
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { margin: 20px 0; white-space: pre-wrap; }
            .cta-button { 
              display: inline-block; 
              padding: 12px 30px; 
              background: linear-gradient(to right, #9333ea, #ec4899);
              color: white; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold;
              margin: 20px 0;
            }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">${content.replace(/\n/g, '<br>')}</div>
            ${ctaText && ctaUrl ? `
              <div style="text-align: center;">
                <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
              </div>
            ` : ''}
            <div class="footer">
              <p>You received this email because you're subscribed to Mikilele Events.</p>
              <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Mikilele Events <events@mikilele.com>',
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
    })

    if (error) {
      throw error
    }

    // Track the send in database
    await supabase.from('campaign_sends').insert({
      campaign_id: campaignId,
      campaign_step_id: stepId,
      user_id: userId,
      channel: 'resend_email',
      recipient_email: recipientEmail,
      status: 'sent',
      sent_at: new Date().toISOString(),
      external_id: data?.id
    })

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id 
    })

  } catch (error: any) {
    console.error('Email send error:', error)
    
    // Log failed send
    const { campaignId, stepId, userId, recipientEmail } = await request.json()
    await supabase.from('campaign_sends').insert({
      campaign_id: campaignId,
      campaign_step_id: stepId,
      user_id: userId,
      channel: 'resend_email',
      recipient_email: recipientEmail,
      status: 'failed',
      error_message: error.message,
      sent_at: new Date().toISOString()
    })

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}