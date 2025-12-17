import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { segmentId } = await request.json()

    // Fetch segment details
    const { data: segment, error: segmentError } = await supabase
      .from('audience_segments')
      .select('*')
      .eq('id', segmentId)
      .single()

    if (segmentError) throw segmentError

    const filters = segment.filters
    const audienceSize = await calculateSegmentSize(filters)

    // Update segment with calculated size
    await supabase
      .from('audience_segments')
      .update({
        estimated_size: audienceSize,
        last_calculated_at: new Date().toISOString()
      })
      .eq('id', segmentId)

    return NextResponse.json({
      success: true,
      segmentId,
      audienceSize
    })

  } catch (error: any) {
    console.error('Segment calculation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

async function calculateSegmentSize(filters: any): Promise<number> {
  try {
    // Start with base query
    let query = supabase
      .from('users')
      .select('id', { count: 'exact', head: true })

    // Apply filters based on the filter object
    for (const [field, filterConfig] of Object.entries(filters)) {
      const { operator, value } = filterConfig as any

      switch (field) {
        case 'has_purchased':
          if (value === 'true') {
            // Users who have made purchases
            const { data: purchasedUsers } = await supabase
              .from('orders')
              .select('user_id')
              .not('user_id', 'is', null)

            const userIds = purchasedUsers?.map(o => o.user_id) || []
            if (userIds.length > 0) {
              query = query.in('id', userIds)
            } else {
              return 0 // No users have purchased
            }
          }
          break

        case 'total_spent':
          // Calculate total spent per user from orders
          const { data: userSpending } = await supabase
            .from('orders')
            .select('user_id, amount')

          const spendingMap: Record<string, number> = {}
          userSpending?.forEach(order => {
            spendingMap[order.user_id] = (spendingMap[order.user_id] || 0) + order.amount
          })

          const qualifiedUserIds = Object.entries(spendingMap)
            .filter(([_, amount]) => {
              if (operator === 'greater_than') return amount > parseFloat(value)
              if (operator === 'less_than') return amount < parseFloat(value)
              if (operator === 'equals') return amount === parseFloat(value)
              return false
            })
            .map(([userId]) => userId)

          if (qualifiedUserIds.length > 0) {
            query = query.in('id', qualifiedUserIds)
          } else {
            return 0
          }
          break

        case 'total_events_attended':
          // Count tickets per user
          const { data: userTickets } = await supabase
            .from('tickets')
            .select('user_id')

          const ticketCounts: Record<string, number> = {}
          userTickets?.forEach(ticket => {
            ticketCounts[ticket.user_id] = (ticketCounts[ticket.user_id] || 0) + 1
          })

          const attendedUserIds = Object.entries(ticketCounts)
            .filter(([_, count]) => {
              if (operator === 'greater_than') return count > parseInt(value)
              if (operator === 'less_than') return count < parseInt(value)
              if (operator === 'equals') return count === parseInt(value)
              return false
            })
            .map(([userId]) => userId)

          if (attendedUserIds.length > 0) {
            query = query.in('id', attendedUserIds)
          } else {
            return 0
          }
          break

        case 'last_purchase_days_ago':
          // Find users based on last purchase date
          const daysAgo = parseInt(value)
          const cutoffDate = new Date()
          cutoffDate.setDate(cutoffDate.getDate() - daysAgo)

          const { data: recentOrders } = await supabase
            .from('orders')
            .select('user_id, created_at')
            .gte('created_at', cutoffDate.toISOString())

          const recentUserIds = [...new Set(recentOrders?.map(o => o.user_id) || [])]
          
          if (operator === 'less_than' && recentUserIds.length > 0) {
            query = query.in('id', recentUserIds)
          } else if (operator === 'greater_than') {
            // Users who haven't purchased recently
            const { data: allOrderUsers } = await supabase
              .from('orders')
              .select('user_id')
            
            const allUserIds = [...new Set(allOrderUsers?.map(o => o.user_id) || [])]
            const inactiveUserIds = allUserIds.filter(id => !recentUserIds.includes(id))
            
            if (inactiveUserIds.length > 0) {
              query = query.in('id', inactiveUserIds)
            } else {
              return 0
            }
          }
          break

        case 'pass_type':
          // Users with specific pass types
          const { data: passes } = await supabase
            .from('user_passes')
            .select('user_id, passes(type)')
            .eq('passes.type', value)

          const passUserIds = [...new Set(passes?.map(p => p.user_id) || [])]
          
          if (passUserIds.length > 0) {
            query = query.in('id', passUserIds)
          } else {
            return 0
          }
          break

        case 'engagement_level':
          // Filter by engagement score from user_engagement_scores table
          const { data: engagementUsers } = await supabase
            .from('user_engagement_scores')
            .select('user_id')
            .eq('engagement_level', value)

          const engagedUserIds = engagementUsers?.map(u => u.user_id) || []
          
          if (engagedUserIds.length > 0) {
            query = query.in('id', engagedUserIds)
          } else {
            return 0
          }
          break

        case 'email_opens':
          // Filter by email engagement
          const { data: emailUsers } = await supabase
            .from('user_engagement_scores')
            .select('user_id, emails_opened')

          const emailEngagedIds = emailUsers
            ?.filter(u => {
              if (operator === 'greater_than') return u.emails_opened > parseInt(value)
              if (operator === 'less_than') return u.emails_opened < parseInt(value)
              if (operator === 'equals') return u.emails_opened === parseInt(value)
              return false
            })
            .map(u => u.user_id) || []

          if (emailEngagedIds.length > 0) {
            query = query.in('id', emailEngagedIds)
          } else {
            return 0
          }
          break

        case 'email_clicks':
          // Filter by email clicks
          const { data: clickUsers } = await supabase
            .from('user_engagement_scores')
            .select('user_id, emails_clicked')

          const clickEngagedIds = clickUsers
            ?.filter(u => {
              if (operator === 'greater_than') return u.emails_clicked > parseInt(value)
              if (operator === 'less_than') return u.emails_clicked < parseInt(value)
              if (operator === 'equals') return u.emails_clicked === parseInt(value)
              return false
            })
            .map(u => u.user_id) || []

          if (clickEngagedIds.length > 0) {
            query = query.in('id', clickEngagedIds)
          } else {
            return 0
          }
          break
      }
    }

    // Execute the query to get count
    const { count, error } = await query

    if (error) throw error

    return count || 0

  } catch (error) {
    console.error('Error calculating segment size:', error)
    return 0
  }
}

// Endpoint to calculate all segments
export async function GET(request: NextRequest) {
  try {
    // Fetch all segments
    const { data: segments, error } = await supabase
      .from('audience_segments')
      .select('id, name')

    if (error) throw error

    const results = []

    // Calculate each segment
    for (const segment of segments || []) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/segments/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segmentId: segment.id })
      })

      const data = await response.json()
      results.push({
        id: segment.id,
        name: segment.name,
        size: data.audienceSize
      })
    }

    return NextResponse.json({
      success: true,
      segments: results
    })

  } catch (error: any) {
    console.error('Bulk calculation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}