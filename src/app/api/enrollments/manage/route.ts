import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch enrollments (optionally filtered by course)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    let query = supabase
      .from('enrollments')
      .select(`
        *,
        courses (
          title,
          level,
          instructor,
          max_students
        ),
        users:user_id (
          id,
          email
        )
      `)
      .order('enrolled_at', { ascending: false })

    if (courseId) {
      query = query.eq('course_id', courseId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      enrollments: data
    })
  } catch (error: any) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new enrollment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      course_id,
      user_id,
      payment_status,
      payment_amount,
      notes
    } = body

    if (!course_id || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Course ID and User ID are required' },
        { status: 400 }
      )
    }

    // Check if course is full
    const { data: course } = await supabase
      .from('courses')
      .select('max_students')
      .eq('id', course_id)
      .single()

    if (course?.max_students) {
      const { count } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course_id)
        .eq('status', 'active')

      if (count && count >= course.max_students) {
        return NextResponse.json(
          { success: false, error: 'Course is full' },
          { status: 400 }
        )
      }
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', course_id)
      .eq('user_id', user_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'User is already enrolled in this course' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        course_id,
        user_id,
        status: 'active',
        payment_status: payment_status || 'pending',
        payment_amount: payment_amount ? parseFloat(payment_amount) : null,
        notes: notes || null,
        progress: 0
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      enrollment: data
    })
  } catch (error: any) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update enrollment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID required' },
        { status: 400 }
      )
    }

    if (updates.payment_amount) {
      updates.payment_amount = parseFloat(updates.payment_amount)
    }
    if (updates.progress !== undefined) {
      updates.progress = parseInt(updates.progress)
    }

    const { data, error } = await supabase
      .from('enrollments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      enrollment: data
    })
  } catch (error: any) {
    console.error('Error updating enrollment:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete enrollment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Enrollment deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting enrollment:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}