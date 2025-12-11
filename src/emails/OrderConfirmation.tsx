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

interface OrderConfirmationEmailProps {
  customerName: string
  orderNumber: string
  orderItems: Array<{
    eventTitle: string
    eventDate: string
    ticketName: string
    quantity: number
    price: number
  }>
  total: number
  orderUrl: string
}

export default function OrderConfirmationEmail({
  customerName = 'Valued Customer',
  orderNumber = 'MKL-12345',
  orderItems = [],
  total = 0,
  orderUrl = 'https://mikilele-customer.vercel.app/my-tickets',
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Mikilele Events order confirmation</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🎉 Order Confirmed!</Heading>
            <Text style={headerText}>
              Thank you for your purchase, {customerName}!
            </Text>
          </Section>

          {/* Order Details */}
          <Section style={section}>
            <Text style={text}>
              Your tickets are confirmed and ready to use. Here are your order details:
            </Text>

            <Section style={orderBox}>
              <Text style={orderNumberStyle}>Order #{orderNumber}</Text>
              
              {orderItems.map((item, index) => (
                <Section key={index} style={ticketItem}>
                  <Text style={eventTitleStyle}>{item.eventTitle}</Text>
                  <Text style={eventDate}>
                    {new Date(item.eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={ticketDetails}>
                    {item.quantity}x {item.ticketName} - ${item.price.toFixed(2)} CAD
                  </Text>
                  <Hr style={divider} />
                </Section>
              ))}

              <Text style={totalText}>
                Total: <strong>${total.toFixed(2)} CAD</strong>
              </Text>
            </Section>
          </Section>

          {/* CTA */}
          <Section style={buttonSection}>
            <Link href={orderUrl} style={button}>
              View My Tickets
            </Link>
          </Section>

          {/* Important Info */}
          <Section style={infoSection}>
            <Text style={infoTitle}>📱 What to bring:</Text>
            <Text style={infoText}>
              • Your confirmation email (this one!)<br />
              • Valid photo ID<br />
              • Your dancing shoes and positive energy! 💃
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions? Reply to this email or contact us at{' '}
              <Link href="mailto:mikileleevents@gmail.com" style={link}>
                mikileleevents@gmail.com
              </Link>
            </Text>
            <Text style={footerText}>
              See you on the dance floor! 🎵
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
  backgroundColor: '#5046e5',
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

const orderBox = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
} as React.CSSProperties

const orderNumberStyle = {
  color: '#5046e5',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 16px',
} as React.CSSProperties

const ticketItem = {
  marginBottom: '16px',
} as React.CSSProperties

const eventTitleStyle = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 4px',
} as React.CSSProperties

const eventDate = {
  color: '#525f7f',
  fontSize: '14px',
  margin: '0 0 8px',
} as React.CSSProperties

const ticketDetails = {
  color: '#525f7f',
  fontSize: '14px',
  margin: '0',
} as React.CSSProperties

const divider = {
  borderColor: '#e1e8ed',
  margin: '16px 0',
} as React.CSSProperties

const totalText = {
  color: '#1a1a1a',
  fontSize: '18px',
  textAlign: 'right' as const,
  margin: '16px 0 0',
} as React.CSSProperties

const buttonSection = {
  padding: '20px',
  textAlign: 'center' as const,
} as React.CSSProperties

const button = {
  backgroundColor: '#5046e5',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
} as React.CSSProperties

const infoSection = {
  backgroundColor: '#fef9e7',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px',
} as React.CSSProperties

const infoTitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
} as React.CSSProperties

const infoText = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
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
  color: '#5046e5',
  textDecoration: 'underline',
} as React.CSSProperties