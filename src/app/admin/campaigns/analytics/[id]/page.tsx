'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, MessageSquare, Phone, Eye, MousePointer, Target, DollarSign } from 'lucide-react'

interface CampaignMetrics {
  totalSent: number
  totalFailed: number
  totalPending: number
  totalOpened: number
  totalClicked: number
  totalConverted: number
  totalRevenue: number
  openRate: string
  clickRate: string
  conversionRate: string
}

interface Campaign {
  id: string
  name: string
  status: string
  type: string
}

export default function CampaignAnalytics() {
  const params = useParams()
  const campaignId = params.id as string

  const [loading, setLoading] = useState(true)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null)
  const [byChannel, setByChannel] = useState<any>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [campaignId])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      const response = await fetch(`/api/campaigns/analytics?campaignId=${campaignId}`)
      const data = await response.json()

      if (data.success) {
        setCampaign(data.campaign)
        setMetrics(data.metrics)
        setByChannel(data.byChannel)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!campaign || !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Campaign Not Found</h2>
          <Link href="/admin/campaigns/analytics" className="text-purple-600 hover:text-purple-700">
            Back to Analytics
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/admin/campaigns/analytics"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analytics
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full ${
              campaign.status === 'active' ? 'bg-green-100 text-green-800' :
              campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {campaign.status.toUpperCase()}
            </span>
            <span className="text-sm text-gray-600">{campaign.type.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Total Sent</div>
            <div className="text-3xl font-bold">{metrics.totalSent.toLocaleString()}</div>
            <div className="text-xs text-red-600 mt-1">
              {metrics.totalFailed} failed
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Open Rate</div>
            <div className="text-3xl font-bold text-blue-600">{metrics.openRate}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.totalOpened.toLocaleString()} opens
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Click Rate</div>
            <div className="text-3xl font-bold text-purple-600">{metrics.clickRate}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.totalClicked.toLocaleString()} clicks
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Revenue</div>
            <div className="text-3xl font-bold text-green-600">${metrics.totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.totalConverted} conversions
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <Eye className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-sm opacity-90 mb-1">Opens</div>
            <div className="text-3xl font-bold mb-2">{metrics.totalOpened.toLocaleString()}</div>
            <div className="text-sm opacity-75">
              {metrics.openRate}% open rate
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <MousePointer className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-sm opacity-90 mb-1">Clicks</div>
            <div className="text-3xl font-bold mb-2">{metrics.totalClicked.toLocaleString()}</div>
            <div className="text-sm opacity-75">
              {metrics.clickRate}% click rate
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow p-6 text-white">
            <Target className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-sm opacity-90 mb-1">Conversions</div>
            <div className="text-3xl font-bold mb-2">{metrics.totalConverted.toLocaleString()}</div>
            <div className="text-sm opacity-75">
              {metrics.conversionRate}% conversion rate
            </div>
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Channel Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="text-2xl font-bold">{byChannel?.email || 0}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <div className="bg-green-100 p-3 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">SMS</div>
                <div className="text-2xl font-bold">{byChannel?.sms || 0}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Phone className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">WhatsApp</div>
                <div className="text-2xl font-bold">{byChannel?.whatsapp || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}