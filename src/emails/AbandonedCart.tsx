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

interface AbandonedCartEmailProps {
  customerName: string
  cartItems: Array<{
    eventTitle: string
    ticketName: string
    quantity: number
    price: number
  }>
  cartUrl: string
  discountCode?: string
}

export default function AbandonedCartEmail({
  customerName = 'Valued Customer',
  cartItems = [],
  cartUrl = 'https://mikilele-customer.vercel.app',
  discountCode = 'COMEBACK10',
}: AbandonedCartEmailProps) {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <Html>
      <Head />
      <Preview>You left something in your cart!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>👋 Come Back!</Heading>
            <Text style={headerText}>
              You left tickets in your cart
            </Text>
          </Section>

          <Section style={section}>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              We noticed you started booking tickets but didn't complete your purchase.
              Don't miss out on these amazing events! 🎉
            </Text>

            <Section style={cartBox}>
              <Heading style={cartTitle}>Your Cart</Heading>
              
              {cartItems.map((item, index) => (
                <Section key={index}>
                  <Text style={itemTitle}>{item.eventTitle}</Text>
                  <Text style={itemDetails}>
                    {item.quantity}x {item.ticketName} - ${(item.price * item.quantity).toFixed(2)} CAD
                  </Text>
                  {index < cartItems.length - 1 && <Hr style={divider} />}
                </Section>
              ))}

              <Hr style={divider} />
              <Text style={totalText}>
                Total: <strong>${total.toFixed(2)} CAD</strong>
              </Text>
            </Section>

            {discountCode && (
              <Section style={discountBox}>
                <Text style={discountTitle}>🎁 Special Offer Just For You!</Text>
                <Text style={discountText}>
                  Get <strong>10% off</strong> your order with code:
                </Text>
                <Text style={discountCodeStyle}>{discountCode}</Text>
                <Text style={discountExpiry}>
                  Valid for 24 hours
                </Text>
              </Section>
            )}
          </Section>

          <Section style={buttonSection}>
            <Link href={cartUrl} style={button}>
              Complete My Purchase
            </Link>
          </Section>

          <Section style={urgencySection}>
            <Text style={urgencyText}>
              ⏰ <strong>Hurry!</strong> Tickets are selling fast and some events may sell out soon.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Questions?{' '}
              <Link href="mailto:mikileleevents@gmail.com" style={link}>
                Contact us
              </Link>
            </Text>
            <Text style={footerText}>
              See you on the dance floor! 💃
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header: React.CSSProperties = {
  padding: '32px 20px',
  backgroundColor: '#ef4444',
  textAlign: 'center',
}

const h1: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 10px',
}

const headerText: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '18px',
  margin: '0',
}

const section: React.CSSProperties = {
  padding: '0 20px',
}

const text: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const cartBox: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '2px solid #ef4444',
}

const cartTitle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  textAlign: 'center',
}

const itemTitle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '12px 0 4px',
}

const itemDetails: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '14px',
  margin: '0 0 12px',
}

const divider: React.CSSProperties = {
  borderColor: '#fca5a5',
  margin: '12px 0',
}

const totalText: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '18px',
  textAlign: 'right',
  margin: '16px 0 0',
}

const discountBox: React.CSSProperties = {
  backgroundColor: '#fef9e7',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center',
  border: '2px dashed #f59e0b',
}

const discountTitle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const discountText: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '16px',
  margin: '8px 0',
}

const discountCodeStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  color: '#f59e0b',
  fontSize: '24px',
  fontWeight: 'bold',
  padding: '12px 24px',
  borderRadius: '8px',
  border: '2px solid #f59e0b',
  margin: '16px auto',
  display: 'inline-block',
}

const discountExpiry: React.CSSProperties = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '8px 0 0',
}

const buttonSection: React.CSSProperties = {
  padding: '20px',
  textAlign: 'center',
}

const button: React.CSSProperties = {
  backgroundColor: '#ef4444',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '14px 40px',
}

const urgencySection: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px',
  textAlign: 'center',
}

const urgencyText: React.CSSProperties = {
  color: '#991b1b',
  fontSize: '14px',
  margin: '0',
}

const footer: React.CSSProperties = {
  padding: '20px',
  textAlign: 'center',
  borderTop: '1px solid #e1e8ed',
  marginTop: '32px',
}

const footerText: React.CSSProperties = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
}

const link: React.CSSProperties = {
  color: '#ef4444',
  textDecoration: 'underline',
}