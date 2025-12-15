import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { eventId, platform } = await request.json()

    if (!eventId || !platform) {
      return NextResponse.json(
        { error: 'Missing eventId or platform' },
        { status: 400 }
      )
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Platform-specific instructions
    const platformGuides: Record<string, string> = {
      facebook: `
        - Conversational and engaging tone
        - 2-3 paragraphs
        - Include event details clearly
        - Add relevant emojis
        - Use 2-3 hashtags
        - Include clear call-to-action
        - Character limit: ~500 characters
      `,
      instagram: `
        - Visual and punchy
        - Short sentences
        - Heavy use of emojis (but tasteful)
        - 8-12 hashtags at the end
        - Line breaks for readability
        - Focus on excitement and FOMO
        - Character limit: ~300 characters for caption
      `,
      twitter: `
        - Concise and punchy
        - 1-2 sentences
        - Key details only
        - 2-3 hashtags
        - Call-to-action
        - Must be under 280 characters
      `,
      linkedin: `
        - Professional tone
        - 2-3 paragraphs
        - Focus on value and networking
        - Minimal emojis
        - 2-3 professional hashtags
        - Character limit: ~500 characters
      `,
    }

    const prompt = `You are a social media expert creating a ${platform} post for an event.

Event Details:
- Title: ${event.title}
- Type: ${event.event_type || 'Social Event'}
- Date: ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Time: ${event.start_time || '8:00 PM'}
- Location: ${event.location || 'TBA'}
- Description: ${event.description || 'Join us for an amazing event!'}
- Price: ${event.price ? `$${event.price} CAD` : 'Free'}

Platform Guidelines for ${platform}:
${platformGuides[platform]}

Generate 3 different post variations, each optimized for ${platform}. Make them engaging, on-brand for a dance/music events company called "Mikilele Events", and include appropriate calls-to-action.

Format your response as a JSON array of 3 posts:
[
  {"variation": 1, "content": "post text here"},
  {"variation": 2, "content": "post text here"},
  {"variation": 3, "content": "post text here"}
]

Only return the JSON array, no other text.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract the text content
    const textContent = message.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    // Parse JSON response
    let posts
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = textContent.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      posts = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', textContent.text)
      throw new Error('Invalid response format from AI')
    }

    return NextResponse.json({
      success: true,
      posts,
      event: {
        title: event.title,
        date: event.date,
        location: event.location,
      },
    })
  } catch (error: any) {
    console.error('Generate social post error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate post' },
      { status: 500 }
    )
  }
}