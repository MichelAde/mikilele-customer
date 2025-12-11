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
} from '@react-email/components'

interface PassConfirmationEmailProps {
  customerName: string
  passName: string
  creditsTotal: number
  expiryDate: string | null
  passUrl: string
}

export default function PassConfirmationEmail({
  customerName = 'Valued Customer',
  passName = '10-Event Pass',
  creditsTotal = 10,
  expiryDate = null,
  passUrl = 'https://mikilele-customer.vercel.app/my-passes',
}: PassConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Mikilele Events pass is activated!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>🎟️ Pass Activated!</Heading>
            <Text style={headerText}>
              Your {passName} is ready to use!
            </Text>
          </Section>

          <Section style={section}>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              Great choice! Your event pass is now active and ready to use.
            </Text>

            <Section style={passBox}>
              <Heading style={passTitle}>{passName}</Heading>
              <Text style={creditsText}>
                <strong>{creditsTotal} credits</strong> available
              </Text>
              {expiryDate && (
                <Text style={expiryText}>
                  Valid until {new Date(expiryDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              )}
            </Section>

            <Text style={text}>
              Use your credits to attend any of our events - just select your event
              and your pass credits will be applied automatically at checkout!
            </Text>
          </Section>

          <Section style={buttonSection}>
            <Link href={passUrl} style={button}>
              View My Pass
            </Link>
          </Section>

          <Section style={benefitsSection}>
            <Text style={benefitsTitle}>✨ Pass Benefits:</Text>
            <Text style={benefitsText}>
              • Save money on multiple events<br />
              • Flexibility to attend any event<br />
              • No expiration worries (if applicable)<br />
              • Priority access to popular events<br />
              • Track your attendance history
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Questions? Contact us at{' '}
              <Link href="mailto:mikileleevents@gmail.com" style={link}>
                mikileleevents@gmail.com
              </Link>
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
  backgroundColor: '#7c3aed',
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

const passBox: React.CSSProperties = {
  backgroundColor: '#faf5ff',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center',
  border: '2px solid #7c3aed',
}

const passTitle: React.CSSProperties = {
  color: '#7c3aed',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const creditsText: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '20px',
  margin: '8px 0',
}

const expiryText: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '14px',
  margin: '8px 0 0',
}

const buttonSection: React.CSSProperties = {
  padding: '20px',
  textAlign: 'center',
}

const button: React.CSSProperties = {
  backgroundColor: '#7c3aed',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '14px 40px',
}

const benefitsSection: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px',
}

const benefitsTitle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const benefitsText: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '22px',
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
  color: '#7c3aed',
  textDecoration: 'underline',
}