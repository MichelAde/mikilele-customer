import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST instead.' },
    { status: 405 }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, category, date, time, location } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Event title is required' },
        { status: 400 }
      )
    }

    console.log('Generating description for:', { title, category, date, time, location })

    const prompt = `You are a professional event marketing copywriter. Create an engaging, compelling event description for the following event:

Event Details:
- Title: ${title}
- Category: ${category || 'Not specified'}
- Date: ${date || 'TBD'}
- Time: ${time || 'TBD'}
- Location: ${location || 'TBD'}

Write a 2-3 paragraph description that:
1. Captures the excitement and value of the event
2. Clearly explains what attendees will experience
3. Creates urgency and encourages registration
4. Is professional yet engaging
5. Is between 150-250 words

Return ONLY the description text, no titles or extra formatting.`

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

    console.log('Generated description:', description.substring(0, 100) + '...')

    return NextResponse.json({
      success: true,
      description,
    })
  } catch (error: any) {
    console.error('Generate description error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate description',
        details: error.stack,
      },
      { status: 500 }
    )
  }
}