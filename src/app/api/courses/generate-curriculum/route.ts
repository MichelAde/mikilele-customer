import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export async function POST(request: NextRequest) {
  try {
    const { courseTitle, level, duration, goals } = await request.json()

    if (!courseTitle) {
      return NextResponse.json(
        { success: false, error: 'Course title is required' },
        { status: 400 }
      )
    }

    const prompt = `You are an expert curriculum designer for Semba & Kizomba dance school. 
    
Create a comprehensive course curriculum for:
Course Title: ${courseTitle}
Level: ${level || 'Beginner'}
Duration: ${duration || '8 weeks'}
Goals: ${goals || 'Master basic steps and movements'}

Please provide:
1. Course Overview (2-3 sentences)
2. Learning Objectives (4-6 bullet points)
3. Weekly Lesson Plan (${duration || '8 weeks'} weeks) - For each week include:
   - Week number and title
   - Topics covered
   - Key movements/techniques
   - Practice exercises
4. Required Materials
5. Assessment Methods

Format the response as valid JSON with this structure:
{
  "overview": "string",
  "objectives": ["string"],
  "weeks": [
    {
      "week": 1,
      "title": "string",
      "topics": ["string"],
      "techniques": ["string"],
      "exercises": ["string"]
    }
  ],
  "materials": ["string"],
  "assessments": ["string"]
}

Keep it practical and engaging for dance students.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Extract JSON from response
    let curriculumData
    try {
      // Remove markdown code blocks if present
      const cleanedText = content.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      curriculumData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Parse error:', parseError)
      // If parsing fails, return the raw text
      return NextResponse.json({
        success: false,
        error: 'Failed to parse AI response',
        rawResponse: content.text
      })
    }

    return NextResponse.json({
      success: true,
      curriculum: curriculumData
    })

  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}