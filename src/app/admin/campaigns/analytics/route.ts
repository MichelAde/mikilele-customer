import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')

    if (campaignId) {
      // Get analytics for specific campaign
      return await getCampaignAnalytics(campaignId)
    } else {
      // Get overall analytics
      return await getOverallAnalytics()
    }
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

async function getCampaignAnalytics(campaignId: string) {
  // Get campaign details
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single()

  if (campaignError) throw campaignError

  // Get all sends for this campaign
  const { data: sends, error: sendsError } = await supabase
    .from('campaign_sends')
    .select('*')
    .eq('campaign_id', campaignId)

  if (sendsError) throw sendsError

  // Calculate metrics
  const totalSent = sends?.filter(s => s.status === 'sent').length || 0
  const totalFailed = sends?.filter(s => s.status === 'failed').length || 0
  const totalPending = sends?.filter(s => s.status === 'pending').length || 0
  const totalOpened = sends?.filter(s => s.opened_at !== null).length || 0
  const totalClicked = sends?.filter(s => s.clicked_at !== null).length || 0
  const totalConverted = sends?.filter(s => s.converted_at !== null).length || 0
  const totalRevenue = sends?.reduce((sum, s) => sum + (s.revenue_generated || 0), 0) || 0

  const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
  const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0
  const conversionRate = totalSent > 0 ? (totalConverted / totalSent) * 100 : 0

  // Get sends by channel
  const byChannel = {
    email: sends?.filter(s => s.channel === 'resend_email').length || 0,
    sms: sends?.filter(s => s.channel === 'twilio_sms').length || 0,
    whatsapp: sends?.filter(s => s.channel === 'twilio_whatsapp').length || 0
  }

  // Get daily breakdown for chart
  const dailyStats = await getDailyStats(campaignId)

  return NextResponse.json({
    success: true,
    campaign: {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      type: campaign.type
    },
    metrics: {
      totalSent,
      totalFailed,
      totalPending,
      totalOpened,
      totalClicked,
      totalConverted,
      totalRevenue,
      openRate: openRate.toFixed(2),
      clickRate: clickRate.toFixed(2),
      conversionRate: conversionRate.toFixed(2)
    },
    byChannel,
    dailyStats
  })
}

async function getOverallAnalytics() {
  // Get all campaigns
  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .select('id, name, status, created_at')

  if (campaignsError) throw campaignsError

  // Get all sends
  const { data: sends, error: sendsError } = await supabase
    .from('campaign_sends')
    .select('*')

  if (sendsError) throw sendsError

  // Calculate overall metrics
  const totalCampaigns = campaigns?.length || 0
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0
  const totalSent = sends?.filter(s => s.status === 'sent').length || 0
  const totalOpened = sends?.filter(s => s.opened_at !== null).length || 0
  const totalClicked = sends?.filter(s => s.clicked_at !== null).length || 0
  const totalConverted = sends?.filter(s => s.converted_at !== null).length || 0
  const totalRevenue = sends?.reduce((sum, s) => sum + (s.revenue_generated || 0), 0) || 0

  const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
  const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0
  const conversionRate = totalSent > 0 ? (totalConverted / totalSent) * 100 : 0

  // Recent campaigns performance
  const recentCampaigns = await Promise.all(
    (campaigns || []).slice(0, 5).map(async (campaign) => {
      const campaignSends = sends?.filter(s => s.campaign_id === campaign.id) || []
      const sent = campaignSends.filter(s => s.status === 'sent').length
      const opened = campaignSends.filter(s => s.opened_at !== null).length
      const revenue = campaignSends.reduce((sum, s) => sum + (s.revenue_generated || 0), 0)

      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        sent,
        opened,
        openRate: sent > 0 ? ((opened / sent) * 100).toFixed(2) : '0.00',
        revenue
      }
    })
  )

  return NextResponse.json({
    success: true,
    overview: {
      totalCampaigns,
      activeCampaigns,
      totalSent,
      totalOpened,
      totalClicked,
      totalConverted,
      totalRevenue,
      openRate: openRate.toFixed(2),
      clickRate: clickRate.toFixed(2),
      conversionRate: conversionRate.toFixed(2)
    },
    recentCampaigns
  })
}

async function getDailyStats(campaignId: string) {
  // Get campaign analytics grouped by date
  const { data, error } = await supabase
    .from('campaign_analytics')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching daily stats:', error)
    return []
  }

  return data || []
}