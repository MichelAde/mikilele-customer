import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch all ticket types or by event
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    let query = supabase
      .from('ticket_types')
      .select('*, events(title, start_datetime)')
      .order('created_at', { ascending: false })

    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      ticketTypes: data
    })
  } catch (error: any) {
    console.error('Error fetching ticket types:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new ticket type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      event_id,
      name,
      description,
      price,
      quantity_available,
      quantity_sold,
      sale_start_date,
      sale_end_date,
      is_active,
      max_per_order,
      min_per_order
    } = body

    // Validation
    if (!event_id || !name || price === undefined || !quantity_available) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('ticket_types')
      .insert({
        event_id,
        name,
        description: description || null,
        price: parseFloat(price),
        quantity_available: parseInt(quantity_available),
        quantity_sold: quantity_sold || 0,
        sale_start_date: sale_start_date || null,  // Convert empty string to null
        sale_end_date: sale_end_date || null,      // Convert empty string to null
        is_active: is_active !== false,
        max_per_order: max_per_order ? parseInt(max_per_order) : null,
        min_per_order: min_per_order ? parseInt(min_per_order) : null
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      ticketType: data
    })
  } catch (error: any) {
    console.error('Error creating ticket type:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update ticket type
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Ticket type ID required' },
        { status: 400 }
      )
    }

    // Convert numeric fields
    if (updates.price) updates.price = parseFloat(updates.price)
    if (updates.quantity_available) updates.quantity_available = parseInt(updates.quantity_available)
    if (updates.quantity_sold) updates.quantity_sold = parseInt(updates.quantity_sold)

    const { data, error } = await supabase
      .from('ticket_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      ticketType: data
    })
  } catch (error: any) {
    console.error('Error updating ticket type:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete ticket type
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Ticket type ID required' },
        { status: 400 }
      )
    }

    // Check if tickets have been sold
    const { data: ticketType } = await supabase
      .from('ticket_types')
      .select('quantity_sold')
      .eq('id', id)
      .single()

    if (ticketType && ticketType.quantity_sold > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete ticket type with sold tickets' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('ticket_types')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Ticket type deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting ticket type:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}