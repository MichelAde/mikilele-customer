import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

interface PlatformGuides {
  [key: string]: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, platform } = body

    if (!eventId || !platform) {
      return NextResponse.json(
        { error: 'Missing eventId or platform' },
        { status: 400 }
      )
    }

    console.log('Generating post for event:', eventId, 'platform:', platform)

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      console.error('Event fetch error:', eventError)
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    console.log('Event found:', event.title)

    const platformGuides: PlatformGuides = {
      facebook: `
        - Conversational and engaging tone
        - 2-3 paragraphs
        - Include event details clearly
        - Add relevant emojis (but not too many)
        - Use 2-3 hashtags
        - Include clear call-to-action
        - Character limit: ~500 characters
        - Focus on community and excitement
      `,
      instagram: `
        - Visual and punchy
        - Short sentences with line breaks
        - Heavy use of emojis (but tasteful)
        - 8-12 hashtags at the end (on separate lines)
        - Focus on excitement and FOMO
        - Caption limit: ~300 characters before hashtags
        - Use relevant dance/event hashtags
      `,
      twitter: `
        - Concise and punchy
        - 1-2 sentences maximum
        - Key details only (what, when, where)
        - 2-3 hashtags
        - Strong call-to-action
        - MUST be under 280 characters total
      `,
      linkedin: `
        - Professional tone
        - 2-3 paragraphs
        - Focus on value, networking, and professional development
        - Minimal emojis (1-2 max)
        - 2-3 professional hashtags
        - Character limit: ~500 characters
        - Emphasize learning and community building
      `,
    }

    const eventDate = new Date(event.date)
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    const prompt = `You are a social media expert creating a ${platform} post for a dance/music event.

Event Details:
- Title: ${event.title}
- Type: ${event.event_type || 'Dance Social Event'}
- Date: ${formattedDate}
- Time: ${event.start_time || '8:00 PM'}
- Location: ${event.location || 'TBA'}
- Description: ${event.description || 'Join us for an amazing event!'}
- Price: ${event.price ? `$${event.price} CAD` : 'See ticket options'}

Platform Guidelines for ${platform}:
${platformGuides[platform]}

Brand Voice:
- Company: Mikilele Events
- Personality: Vibrant, welcoming, community-focused
- Focus: Dance, music, connection, fun

Generate 3 different post variations, each optimized for ${platform}. 
Make them engaging, authentic, and include appropriate calls-to-action.
Each variation should have a different style or angle.

Format your response as a JSON array of 3 posts:
[
  {"variation": 1, "content": "post text here"},
  {"variation": 2, "content": "post text here"},
  {"variation": 3, "content": "post text here"}
]

IMPORTANT: 
- Only return the JSON array, no markdown code blocks or other text
- Make sure the JSON is valid
- Respect character limits for ${platform}
- Include emojis naturally within the text
- For Instagram, put hashtags on separate lines at the end`

    console.log('Calling Claude API...')

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

    console.log('Claude API response received')

    const textContent = message.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      console.error('No text response from Claude')
      throw new Error('No text response from Claude')
    }

    console.log('Raw AI response:', textContent.text)

    let posts
    try {
      const cleanedResponse = textContent.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      console.log('Cleaned response:', cleanedResponse)
      
      posts = JSON.parse(cleanedResponse)
      
      if (!Array.isArray(posts) || posts.length === 0) {
        throw new Error('Invalid posts array')
      }
      
      console.log('Successfully parsed', posts.length, 'posts')
    } catch (parseError: any) {
      console.error('Failed to parse AI response:', textContent.text)
      console.error('Parse error:', parseError.message)
      throw new Error('Invalid response format from AI: ' + parseError.message)
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
      { 
        error: error.message || 'Failed to generate post',
        details: error.stack,
      },
      { status: 500 }
    )
  }
}