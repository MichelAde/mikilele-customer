import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { campaignId, testMode = false } = await request.json()

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError) throw campaignError

    if (campaign.status !== 'active' && !testMode) {
      return NextResponse.json(
        { success: false, error: 'Campaign is not active' },
        { status: 400 }
      )
    }

    // Fetch campaign steps
    const { data: steps, error: stepsError } = await supabase
      .from('campaign_steps')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('step_number', { ascending: true })

    if (stepsError) throw stepsError

    if (!steps || steps.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No steps found for campaign' },
        { status: 400 }
      )
    }

    // Fetch target audiences
    const { data: audiences, error: audiencesError } = await supabase
      .from('campaign_audiences')
      .select('segment_id')
      .eq('campaign_id', campaignId)

    if (audiencesError) throw audiencesError

    if (!audiences || audiences.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No target audience defined' },
        { status: 400 }
      )
    }

    // Get users (in production, filter by segments)
    const limit = testMode ? 5 : 1000 // Limit for testing
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, raw_user_meta_data')
      .limit(limit)

    if (usersError) throw usersError

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No users found to send to' },
        { status: 400 }
      )
    }

    let scheduledCount = 0

    // Schedule sends for all steps and all users
    for (const user of users) {
      const recipientEmail = user.email
      
      for (const step of steps) {
        // Calculate send time based on step delays
        const delayMinutes = (step.delay_days * 24 * 60) + (step.delay_hours * 60) + (step.delay_minutes || 0)
        const scheduledSendTime = new Date()
        scheduledSendTime.setMinutes(scheduledSendTime.getMinutes() + delayMinutes)

        // Insert into campaign_sends with pending status
        const { error: insertError } = await supabase
          .from('campaign_sends')
          .insert({
            campaign_id: campaignId,
            campaign_step_id: step.id,
            user_id: user.id,
            channel: step.channel,
            recipient_email: step.channel === 'resend_email' ? recipientEmail : null,
            recipient_phone: null, // Would get from user data
            status: 'pending',
            scheduled_send_time: scheduledSendTime.toISOString()
          })

        if (!insertError) {
          scheduledCount++
        } else {
          console.error('Error scheduling send:', insertError)
        }
      }
    }

    // Update campaign with execution details
    await supabase
      .from('campaigns')
      .update({ 
        actual_audience_size: users.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    return NextResponse.json({
      success: true,
      message: testMode ? 'Test campaign scheduled' : 'Campaign execution started',
      stats: {
        totalUsers: users.length,
        totalSteps: steps.length,
        totalScheduled: scheduledCount
      }
    })

  } catch (error: any) {
    console.error('Campaign execution error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}