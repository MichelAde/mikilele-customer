import { Resend } from 'resend'
import { render } from '@react-email/render'

// Don't check API key at build time - only at runtime
export const resend = new Resend(process.env.RESEND_API_KEY || '')

export const FROM_EMAIL = 'Mikilele Events <onboarding@resend.dev>'

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: React.ReactElement
}) {
  try {
    // Check API key at runtime, not build time
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not set')
      return { success: false, error: 'Email service not configured' }
    }

    const html = await render(react)

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    console.log('✅ Email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Email send exception:', error)
    return { success: false, error }
  }
}