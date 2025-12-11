import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'

interface EventReminderEmailProps {
  customerName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  location: string
  ticketCount: number
  ticketUrl: string
}

export default function EventReminderEmail({
  customerName = 'Valued Customer',
  eventTitle = 'Saturday Salsa Social',
  eventDate = '2025-12-11',
  eventTime = '4:22 PM',
  location = 'Latin Dance Hub, Toronto',
  ticketCount = 2,
  ticketUrl = 'https://mikilele-customer.vercel.app/my-tickets',
}: EventReminderEmailProps) {
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Html>
      <Head />
      <Preview>Tomorrow: {eventTitle} - Don't forget!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>🎉 Event Tomorrow!</Heading>
            <Text style={headerText}>
              See you at {eventTitle}
            </Text>
          </Section>

          <Section style={section}>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={urgentText}>
              This is a friendly reminder that your event is happening tomorrow! 🗓️
            </Text>

            <Section style={eventBox}>
              <Heading style={eventTitleStyle}>{eventTitle}</Heading>
              <Hr style={divider} />
              
              <Text style={detailRow}>
                <strong>📅 Date:</strong> {formattedDate}
              </Text>
              <Text style={detailRow}>
                <strong>🕐 Time:</strong> {eventTime}
              </Text>
              <Text style={detailRow}>
                <strong>📍 Location:</strong> {location}
              </Text>
              <Text style={detailRow}>
                <strong>🎫 Tickets:</strong> {ticketCount}
              </Text>
            </Section>
          </Section>

          <Section style={buttonSection}>
            <Link href={ticketUrl} style={button}>
              View My Tickets
            </Link>
          </Section>

          <Section style={reminderSection}>
            <Text style={reminderTitle}>📋 Don't Forget:</Text>
            <Text style={reminderText}>
              ✅ Bring your confirmation email<br />
              ✅ Valid photo ID<br />
              ✅ Arrive 15 minutes early<br />
              ✅ Wear comfortable dancing shoes<br />
              ✅ Bring your energy! 💃🕺
            </Text>
          </Section>

          <Section style={mapSection}>
            <Text style={text}>
              📍 <Link href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`} style={link}>
                Get Directions
              </Link>
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Need to make changes?{' '}
              <Link href="mailto:mikileleevents@gmail.com" style={link}>
                Contact us
              </Link>
            </Text>
            <Text style={footerText}>
              Can't wait to see you there! 🎵
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles with proper type assertions
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
} as React.CSSProperties

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
} as React.CSSProperties

const header = {
  padding: '32px 20px',
  backgroundColor: '#f59e0b',
  textAlign: 'center' as const,
} as React.CSSProperties

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 10px',
} as React.CSSProperties

const headerText = {
  color: '#ffffff',
  fontSize: '18px',
  margin: '0',
} as React.CSSProperties

const section = {
  padding: '0 20px',
} as React.CSSProperties

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
} as React.CSSProperties

const urgentText = {
  color: '#1a1a1a',
  fontSize: '18px',
  lineHeight: '26px',
  fontWeight: 'bold',
  margin: '16px 0',
  textAlign: 'center' as const,
} as React.CSSProperties

const eventBox = {
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '2px solid #f59e0b',
} as React.CSSProperties

const eventTitleStyle = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  textAlign: 'center' as const,
} as React.CSSProperties

const divider = {
  borderColor: '#fbbf24',
  margin: '16px 0',
} as React.CSSProperties

const detailRow = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '8px 0',
} as React.CSSProperties

const buttonSection = {
  padding: '20px',
  textAlign: 'center' as const,
} as React.CSSProperties

const button = {
  backgroundColor: '#f59e0b',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
} as React.CSSProperties

const reminderSection = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px',
} as React.CSSProperties

const reminderTitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
} as React.CSSProperties

const reminderText = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
} as React.CSSProperties

const mapSection = {
  textAlign: 'center' as const,
  padding: '20px',
} as React.CSSProperties

const footer = {
  padding: '20px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e1e8ed',
  marginTop: '32px',
} as React.CSSProperties

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
} as React.CSSProperties

const link = {
  color: '#f59e0b',
  textDecoration: 'underline',
} as React.CSSProperties