import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch all passes
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('passes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get sales count for each pass
    const passesWithSales = await Promise.all(
      (data || []).map(async (pass) => {
        const { count } = await supabase
          .from('user_passes')
          .select('*', { count: 'exact', head: true })
          .eq('pass_id', pass.id)

        return {
          ...pass,
          total_sold: count || 0
        }
      })
    )

    return NextResponse.json({
      success: true,
      passes: passesWithSales
    })
  } catch (error: any) {
    console.error('Error fetching passes:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new pass
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      type,
      price,
      duration_days,
      max_events,
      is_active,
      features
    } = body

    // Validation
    if (!name || !type || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('passes')
      .insert({
        name,
        description: description || null,
        type,
        price: parseFloat(price),
        duration_days: duration_days ? parseInt(duration_days) : null,
        max_events: max_events ? parseInt(max_events) : null,
        is_active: is_active !== false,
        features: features || null
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      pass: data
    })
  } catch (error: any) {
    console.error('Error creating pass:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update pass
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Pass ID required' },
        { status: 400 }
      )
    }

    // Convert numeric fields
    if (updates.price) updates.price = parseFloat(updates.price)
    if (updates.duration_days) updates.duration_days = parseInt(updates.duration_days)
    if (updates.max_events) updates.max_events = parseInt(updates.max_events)

    const { data, error } = await supabase
      .from('passes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      pass: data
    })
  } catch (error: any) {
    console.error('Error updating pass:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete pass
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Pass ID required' },
        { status: 400 }
      )
    }

    // Check if pass has been sold
    const { count } = await supabase
      .from('user_passes')
      .select('*', { count: 'exact', head: true })
      .eq('pass_id', id)

    if (count && count > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete pass with active users' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('passes')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Pass deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting pass:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}