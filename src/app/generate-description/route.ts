import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { title, category, venue, city } = await request.json()

    const prompt = `Write an engaging event description for a ${category.replace('_', ' ')} called "${title}" at ${venue} in ${city}. 

Make it exciting, professional, and include:
- What attendees can expect
- Why they should attend
- The atmosphere and vibe
- Keep it to 2-3 paragraphs
- Write in second person (you will experience...)

Do not use markdown formatting. Just plain text paragraphs.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    const data = await response.json()
    const description = data.content[0].text

    return NextResponse.json({ description })
  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}