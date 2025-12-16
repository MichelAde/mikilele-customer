import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not set')
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { title, category, date, time, location } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Event title is required' },
        { status: 400 }
      )
    }

    console.log('Generating description for:', title)

    const prompt = `You are a professional event marketing copywriter for Mikilele Events, a dance and music event company specializing in Kizomba, Semba, and Latin dance events.

Create an engaging event description for:

Event Details:
- Title: ${title}
- Category: ${category || 'Dance Event'}
- Date: ${date || 'TBD'}
- Time: ${time || 'TBD'}
- Location: ${location || 'Toronto'}

Write a compelling 2-3 paragraph description (150-250 words) that:
1. Captures the excitement and energy of the event
2. Clearly explains what attendees will experience
3. Highlights the music, dancing, and community aspects
4. Creates urgency and encourages ticket purchases
5. Uses a warm, inviting, and professional tone

Return ONLY the description text with no titles, headers, or extra formatting.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const textContent = message.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    const description = textContent.text.trim()

    console.log('✅ Generated description:', description.substring(0, 100) + '...')

    return NextResponse.json({
      success: true,
      description,
    })
  } catch (error: any) {
    console.error('❌ Generate description error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate description',
      },
      { status: 500 }
    )
  }
}