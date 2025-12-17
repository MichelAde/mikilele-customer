import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const timeRange = searchParams.get('timeRange') || '30' // days

    if (eventId) {
      // Get analytics for specific event
      return await getEventAnalytics(eventId)
    } else {
      // Get overall sales analytics
      return await getOverallAnalytics(timeRange)
    }
  } catch (error: any) {
    console.error('Sales analytics error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

async function getOverallAnalytics(timeRange: string) {
  const days = parseInt(timeRange)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get all orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .eq('status', 'completed')

  if (ordersError) throw ordersError

  // Get all tickets
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('*, events(title, start_datetime)')
    .gte('purchased_at', startDate.toISOString())

  if (ticketsError) throw ticketsError

  // Get all passes
  const { data: passes, error: passesError } = await supabase
    .from('user_passes')
    .select('*, passes(name, price)')
    .gte('purchased_at', startDate.toISOString())

  if (passesError) throw passesError

  // Calculate metrics
  const totalRevenue = orders?.reduce((sum, order) => sum + order.amount, 0) || 0
  const totalTicketsSold = tickets?.length || 0
  const totalPassesSold = passes?.length || 0
  const totalOrders = orders?.length || 0

  // Revenue by day for chart
  const revenueByDay = calculateRevenueByDay(orders || [], days)

  // Top selling events
  const eventSales = calculateEventSales(tickets || [])

  // Recent orders
  const recentOrders = orders?.slice(0, 10) || []

  return NextResponse.json({
    success: true,
    overview: {
      totalRevenue,
      totalTicketsSold,
      totalPassesSold,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    },
    revenueByDay,
    topEvents: eventSales.slice(0, 5),
    recentOrders
  })
}

async function getEventAnalytics(eventId: string) {
  // Get event details
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (eventError) throw eventError

  // Get tickets for this event
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('*')
    .eq('event_id', eventId)

  if (ticketsError) throw ticketsError

  // Get orders for this event's tickets
  const ticketIds = tickets?.map(t => t.id) || []
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .in('ticket_id', ticketIds)
    .eq('status', 'completed')

  if (ordersError) throw ordersError

  // Calculate metrics
  const totalRevenue = orders?.reduce((sum, order) => sum + order.amount, 0) || 0
  const ticketsSold = tickets?.length || 0
  const capacity = event.max_capacity || 0
  const percentageSold = capacity > 0 ? (ticketsSold / capacity) * 100 : 0

  // Sales by day
  const salesByDay = calculateTicketSalesByDay(tickets || [])

  return NextResponse.json({
    success: true,
    event: {
      id: event.id,
      title: event.title,
      start_datetime: event.start_datetime,
      max_capacity: capacity
    },
    metrics: {
      totalRevenue,
      ticketsSold,
      capacity,
      percentageSold: percentageSold.toFixed(2),
      remainingCapacity: capacity - ticketsSold
    },
    salesByDay
  })
}

function calculateRevenueByDay(orders: any[], days: number) {
  const revenueMap: { [key: string]: number } = {}
  
  // Initialize all days with 0
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateKey = date.toISOString().split('T')[0]
    revenueMap[dateKey] = 0
  }

  // Fill in actual revenue
  orders.forEach(order => {
    const dateKey = order.created_at.split('T')[0]
    if (revenueMap[dateKey] !== undefined) {
      revenueMap[dateKey] += order.amount
    }
  })

  return Object.entries(revenueMap).map(([date, revenue]) => ({
    date,
    revenue
  }))
}

function calculateEventSales(tickets: any[]) {
  const eventMap: { [key: string]: { title: string; count: number; eventId: string } } = {}

  tickets.forEach(ticket => {
    const eventId = ticket.events?.id || 'unknown'
    const eventTitle = ticket.events?.title || 'Unknown Event'
    
    if (!eventMap[eventId]) {
      eventMap[eventId] = { title: eventTitle, count: 0, eventId }
    }
    eventMap[eventId].count++
  })

  return Object.values(eventMap)
    .sort((a, b) => b.count - a.count)
}

function calculateTicketSalesByDay(tickets: any[]) {
  const salesMap: { [key: string]: number } = {}

  tickets.forEach(ticket => {
    if (ticket.purchased_at) {
      const dateKey = ticket.purchased_at.split('T')[0]
      salesMap[dateKey] = (salesMap[dateKey] || 0) + 1
    }
  })

  return Object.entries(salesMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
