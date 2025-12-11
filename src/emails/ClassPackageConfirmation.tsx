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

interface ClassPackageConfirmationEmailProps {
  customerName: string
  packageName: string
  creditsTotal: number
  expiryDate: string | null
  packageUrl: string
}

export default function ClassPackageConfirmationEmail({
  customerName = 'Valued Customer',
  packageName = '4-Class Pack',
  creditsTotal = 4,
  expiryDate = null,
  packageUrl = 'https://mikilele-customer.vercel.app/classes/my-classes',
}: ClassPackageConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Mikilele dance class package is ready!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>💃 Let's Dance!</Heading>
            <Text style={headerText}>
              Your {packageName} is activated
            </Text>
          </Section>

          <Section style={section}>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              Congratulations! You're all set to start your dance journey with us.
            </Text>

            <Section style={packageBox}>
              <Heading style={packageTitle}>{packageName}</Heading>
              <Text style={creditsText}>
                <strong>{creditsTotal} class credits</strong>
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
              Ready to book your first class? Browse our schedule and reserve your spot!
            </Text>
          </Section>

          <Section style={buttonSection}>
            <Link href="https://mikilele-customer.vercel.app/classes" style={button}>
              Browse Classes
            </Link>
            <Link href={packageUrl} style={buttonSecondary}>
              View My Package
            </Link>
          </Section>

          <Section style={benefitsSection}>
            <Text style={benefitsTitle}>🌟 Your Package Includes:</Text>
            <Text style={benefitsText}>
              • {creditsTotal} classes with expert instructors<br />
              • Free prática after each class<br />
              • All dance styles (Semba, Kizomba, Zouk)<br />
              • All levels welcome<br />
              • Flexible scheduling
            </Text>
          </Section>

          <Section style={tipsSection}>
            <Text style={tipsTitle}>💡 First Class Tips:</Text>
            <Text style={tipsText}>
              • Arrive 10 minutes early<br />
              • Wear comfortable shoes<br />
              • No partner needed!<br />
              • Bring water<br />
              • Come ready to have fun! 🎉
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Questions? Contact us at{' '}
              <Link href="mailto:mikileleevents@gmail.com" style={link}>
                mikileleevents@gmail.com
              </Link>
            </Text>
            <Text style={footerText}>
              See you in class! 💃🕺
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
  backgroundColor: '#ec4899',
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

const packageBox: React.CSSProperties = {
  backgroundColor: '#fdf2f8',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center',
  border: '2px solid #ec4899',
}

const packageTitle: React.CSSProperties = {
  color: '#ec4899',
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
  backgroundColor: '#ec4899',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '14px 40px',
  margin: '0 10px 10px',
}

const buttonSecondary: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '2px solid #ec4899',
  borderRadius: '8px',
  color: '#ec4899',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '14px 40px',
  margin: '0 10px 10px',
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

const tipsSection: React.CSSProperties = {
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px',
}

const tipsTitle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const tipsText: React.CSSProperties = {
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
  color: '#ec4899',
  textDecoration: 'underline',
}