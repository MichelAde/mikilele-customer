import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
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

    const prompt = `Create an engaging event description for:

Title: ${title}
Category: ${category || 'Event'}
Date: ${date || 'TBD'}
Time: ${time || 'TBD'}
Location: ${location || 'Toronto'}

Write 2-3 paragraphs (150-250 words) that are exciting and encourage attendance.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = message.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response')
    }

    return NextResponse.json({
      success: true,
      description: textContent.text.trim(),
    })
  } catch (error: any) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate' },
      { status: 500 }
    )
  }
}