import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch attendance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const enrollmentId = searchParams.get('enrollmentId')

    let query = supabase
      .from('attendance')
      .select(`
        *,
        enrollments (
          id,
          user_id,
          courses (
            title,
            instructor
          )
        )
      `)
      .order('date', { ascending: false })

    if (courseId) {
      query = query.eq('course_id', courseId)
    }

    if (enrollmentId) {
      query = query.eq('enrollment_id', enrollmentId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      attendance: data
    })
  } catch (error: any) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create attendance record (check-in)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      enrollment_id,
      course_id,
      date,
      status,
      notes
    } = body

    if (!enrollment_id || !course_id) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID and Course ID are required' },
        { status: 400 }
      )
    }

    // Check if attendance already exists for this date
    const attendanceDate = date || new Date().toISOString().split('T')[0]
    
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('enrollment_id', enrollment_id)
      .eq('date', attendanceDate)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Attendance already recorded for this date' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        enrollment_id,
        course_id,
        date: attendanceDate,
        status: status || 'present',
        notes: notes || null
      })
      .select()
      .single()

    if (error) throw error

    // Update enrollment progress
    await updateEnrollmentProgress(enrollment_id, course_id)

    return NextResponse.json({
      success: true,
      attendance: data
    })
  } catch (error: any) {
    console.error('Error creating attendance:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update attendance record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Attendance ID required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Update enrollment progress if needed
    if (data.enrollment_id && data.course_id) {
      await updateEnrollmentProgress(data.enrollment_id, data.course_id)
    }

    return NextResponse.json({
      success: true,
      attendance: data
    })
  } catch (error: any) {
    console.error('Error updating attendance:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete attendance record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Attendance ID required' },
        { status: 400 }
      )
    }

    // Get enrollment info before deleting
    const { data: attendance } = await supabase
      .from('attendance')
      .select('enrollment_id, course_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Update enrollment progress
    if (attendance) {
      await updateEnrollmentProgress(attendance.enrollment_id, attendance.course_id)
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting attendance:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Helper function to calculate and update enrollment progress
async function updateEnrollmentProgress(enrollmentId: string, courseId: string) {
  try {
    // Get course duration
    const { data: course } = await supabase
      .from('courses')
      .select('duration_weeks')
      .eq('id', courseId)
      .single()

    if (!course?.duration_weeks) return

    // Count attendance records
    const { count } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('enrollment_id', enrollmentId)
      .eq('status', 'present')

    // Calculate progress (assuming 1 class per week)
    const totalClasses = course.duration_weeks
    const attendedClasses = count || 0
    const progress = Math.min(Math.round((attendedClasses / totalClasses) * 100), 100)

    // Update enrollment
    await supabase
      .from('enrollments')
      .update({ progress })
      .eq('id', enrollmentId)

  } catch (error) {
    console.error('Error updating progress:', error)
  }
}