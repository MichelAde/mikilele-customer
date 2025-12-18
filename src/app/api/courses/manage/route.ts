import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch all courses
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get enrollment count for each course
    const coursesWithEnrollments = await Promise.all(
      (data || []).map(async (course) => {
        const { count } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)

        return {
          ...course,
          total_enrolled: count || 0
        }
      })
    )

    return NextResponse.json({
      success: true,
      courses: coursesWithEnrollments
    })
  } catch (error: any) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      level,
      duration_weeks,
      max_students,
      price,
      schedule,
      instructor,
      curriculum,
      is_active
    } = body

    if (!title || !level) {
      return NextResponse.json(
        { success: false, error: 'Title and level are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        title,
        description: description || null,
        level,
        duration_weeks: duration_weeks ? parseInt(duration_weeks) : null,
        max_students: max_students ? parseInt(max_students) : null,
        price: price ? parseFloat(price) : null,
        schedule: schedule || null,
        instructor: instructor || null,
        curriculum: curriculum || null,
        is_active: is_active !== false
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      course: data
    })
  } catch (error: any) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update course
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Course ID required' },
        { status: 400 }
      )
    }

    if (updates.duration_weeks) updates.duration_weeks = parseInt(updates.duration_weeks)
    if (updates.max_students) updates.max_students = parseInt(updates.max_students)
    if (updates.price) updates.price = parseFloat(updates.price)

    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      course: data
    })
  } catch (error: any) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete course
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Course ID required' },
        { status: 400 }
      )
    }

    const { count } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', id)

    if (count && count > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete course with enrolled students' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}