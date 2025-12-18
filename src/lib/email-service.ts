import { Resend } from 'resend'
import * as templates from './email-templates'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface SendEmailOptions {
  to: string | string[]
  template: keyof typeof templates
  data: any
  attachments?: Array<{
    filename: string
    content: Buffer | string
  }>
}

export async function sendEmail({
  to,
  template,
  data,
  attachments
}: SendEmailOptions) {
  try {
    // Get template function
    const templateFunction = templates[template as keyof typeof templates]
    if (!templateFunction) {
      throw new Error(`Template ${template} not found`)
    }

    // Generate email content
    const emailContent = (templateFunction as any)(...Object.values(data))

    // Replace placeholders with actual URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    let html = emailContent.html
      .replace(/\{\{portal_url\}\}/g, `${baseUrl}/portal`)
      .replace(/\{\{admin_url\}\}/g, `${baseUrl}/admin`)
      .replace(/\{\{unsubscribe_url\}\}/g, `${baseUrl}/unsubscribe`)

    let text = emailContent.text
      .replace(/\{\{portal_url\}\}/g, `${baseUrl}/portal`)
      .replace(/\{\{admin_url\}\}/g, `${baseUrl}/admin`)
      .replace(/\{\{unsubscribe_url\}\}/g, `${baseUrl}/unsubscribe`)

    // Send email via Resend
    const { data: responseData, error } = await resend.emails.send({
      from: 'Mikilele Events <notifications@mikilele.com>',
      to: Array.isArray(to) ? to : [to],
      subject: emailContent.subject,
      html,
      text,
      attachments
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    // ✅ FIX: Access id correctly from responseData
    console.log('Email sent successfully:', responseData?.id)
    return { success: true, id: responseData?.id }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
}

// Convenience functions for common emails
export async function sendWelcomeEmail(to: string, userName: string) {
  return sendEmail({
    to,
    template: 'welcomeEmail',
    data: { userName }
  })
}

export async function sendEnrollmentConfirmation(
  to: string,
  userName: string,
  courseName: string,
  instructor: string,
  schedule: string
) {
  return sendEmail({
    to,
    template: 'enrollmentConfirmationEmail',
    data: { userName, courseName, instructor, schedule }
  })
}

export async function sendTicketPurchase(
  to: string,
  userName: string,
  eventName: string,
  eventDate: string,
  ticketType: string,
  quantity: number
) {
  return sendEmail({
    to,
    template: 'ticketPurchaseEmail',
    data: { userName, eventName, eventDate, ticketType, quantity }
  })
}

export async function sendEventReminder(
  to: string,
  userName: string,
  eventName: string,
  eventDate: string,
  location: string
) {
  return sendEmail({
    to,
    template: 'eventReminderEmail',
    data: { userName, eventName, eventDate, location }
  })
}

export async function sendClassReminder(
  to: string,
  userName: string,
  courseName: string,
  classDate: string,
  instructor: string
) {
  return sendEmail({
    to,
    template: 'classReminderEmail',
    data: { userName, courseName, classDate, instructor }
  })
}

export async function sendPaymentReceipt(
  to: string,
  userName: string,
  orderNumber: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number
) {
  return sendEmail({
    to,
    template: 'paymentReceiptEmail',
    data: { userName, orderNumber, items, total }
  })
}

export async function sendCourseCompletion(
  to: string,
  userName: string,
  courseName: string,
  completionDate: string
) {
  return sendEmail({
    to,
    template: 'courseCompletionEmail',
    data: { userName, courseName, completionDate }
  })
}

export async function sendPasswordReset(to: string, resetUrl: string) {
  return sendEmail({
    to,
    template: 'passwordResetEmail',
    data: { resetUrl }
  })
}

export async function sendAdminAlert(
  to: string | string[],
  alertType: string,
  message: string,
  details: any
) {
  return sendEmail({
    to,
    template: 'adminAlertEmail',
    data: { alertType, message, details }
  })
}