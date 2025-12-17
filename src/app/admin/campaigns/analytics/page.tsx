'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Users, Mail, DollarSign, MousePointer, Eye, Target } from 'lucide-react'

interface OverviewMetrics {
  totalCampaigns: number
  activeCampaigns: number
  totalSent: number
  totalOpened: number
  totalClicked: number
  totalConverted: number
  totalRevenue: number
  openRate: string
  clickRate: string
  conversionRate: string
}

interface RecentCampaign {
  id: string
  name: string
  status: string
  sent: number
  opened: number
  openRate: string
  revenue: number
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<OverviewMetrics | null>(null)
  const [recentCampaigns, setRecentCampaigns] = useState<RecentCampaign[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      const response = await fetch('/api/campaigns/analytics')
      const data = await response.json()

      if (data.success) {
        setOverview(data.overview)
        setRecentCampaigns(data.recentCampaigns || [])
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/admin/campaigns"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Campaign Analytics</h1>
          <p className="text-gray-600">Track performance across all campaigns</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Total Campaigns</div>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold">{overview?.totalCampaigns || 0}</div>
            <div className="text-xs text-gray-500 mt-1">
              {overview?.activeCampaigns || 0} active
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Messages Sent</div>
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold">{overview?.totalSent.toLocaleString() || 0}</div>
            <div className="text-xs text-gray-500 mt-1">
              Across all channels
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Open Rate</div>
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold">{overview?.openRate || 0}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {overview?.totalOpened.toLocaleString() || 0} opens
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Total Revenue</div>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold">${overview?.totalRevenue.toLocaleString() || 0}</div>
            <div className="text-xs text-gray-500 mt-1">
              {overview?.totalConverted || 0} conversions
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm opacity-90">Open Rate</div>
                <div className="text-3xl font-bold">{overview?.openRate || 0}%</div>
              </div>
            </div>
            <div className="text-sm opacity-75">
              {overview?.totalOpened.toLocaleString() || 0} / {overview?.totalSent.toLocaleString() || 0} opened
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <MousePointer className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm opacity-90">Click Rate</div>
                <div className="text-3xl font-bold">{overview?.clickRate || 0}%</div>
              </div>
            </div>
            <div className="text-sm opacity-75">
              {overview?.totalClicked.toLocaleString() || 0} / {overview?.totalSent.toLocaleString() || 0} clicked
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm opacity-90">Conversion Rate</div>
                <div className="text-3xl font-bold">{overview?.conversionRate || 0}%</div>
              </div>
            </div>
            <div className="text-sm opacity-75">
              {overview?.totalConverted.toLocaleString() || 0} / {overview?.totalSent.toLocaleString() || 0} converted
            </div>
          </div>
        </div>

        {/* Recent Campaigns Performance */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Campaigns</h2>
          </div>
          <div className="p-6">
            {recentCampaigns.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No campaign data available yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Campaign</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Sent</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Opened</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Open Rate</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium">{campaign.name}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">{campaign.sent.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right">{campaign.opened.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right font-semibold">{campaign.openRate}%</td>
                        <td className="py-4 px-4 text-right font-semibold text-green-600">
                          ${campaign.revenue.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/admin/campaigns/analytics/${campaign.id}`}
                            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}