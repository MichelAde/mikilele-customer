'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  ArrowLeft, 
  TrendingUp, 
  Mail, 
  MessageSquare, 
  Calendar,
  BarChart3,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Eye
} from 'lucide-react'

interface Campaign {
  id: string
  name: string
  description: string
  type: string
  status: string
  goal: string
  target_revenue: number
  actual_audience_size: number
  start_date: string
  created_at: string
}

interface CampaignStats {
  total: number
  active: number
  draft: number
  completed: number
  total_revenue: number
}

export default function CampaignsDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<CampaignStats>({
    total: 0,
    active: 0,
    draft: 0,
    completed: 0,
    total_revenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  useEffect(() => {
    fetchCampaigns()
  }, [filter])

  async function fetchCampaigns() {
    setLoading(true)
    try {
      let query = supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error

      if (data) {
        setCampaigns(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateStats(campaignData: Campaign[]) {
    const stats = {
      total: campaignData.length,
      active: campaignData.filter(c => c.status === 'active').length,
      draft: campaignData.filter(c => c.status === 'draft').length,
      completed: campaignData.filter(c => c.status === 'completed').length,
      total_revenue: campaignData.reduce((sum, c) => sum + (c.target_revenue || 0), 0)
    }
    setStats(stats)
  }

  async function updateCampaignStatus(id: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      fetchCampaigns()
    } catch (error) {
      console.error('Error updating campaign:', error)
      alert('Failed to update campaign status')
    }
  }

  async function deleteCampaign(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchCampaigns()
    } catch (error) {
      console.error('Error deleting campaign:', error)
      alert('Failed to delete campaign')
    }
  }

  const typeIcons: Record<string, any> = {
    email: Mail,
    multi_channel: MessageSquare,
    event_promo: Calendar,
    seasonal: TrendingUp,
    re_engagement: BarChart3
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-800',
    active: 'bg-green-200 text-green-800',
    paused: 'bg-yellow-200 text-yellow-800',
    completed: 'bg-blue-200 text-blue-800',
    archived: 'bg-gray-300 text-gray-600'
  }

  const typeLabels: Record<string, string> = {
    email: 'Email',
    multi_channel: 'Multi-Channel',
    event_promo: 'Event Promo',
    seasonal: 'Seasonal',
    re_engagement: 'Re-engagement'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
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
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Marketing Campaigns</h1>
            <p className="text-gray-600">Create and manage automated marketing campaigns</p>
          </div>
          <Link
            href="/admin/campaigns/create"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Campaign
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Total Campaigns</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Active</div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Drafts</div>
            <div className="text-3xl font-bold text-gray-600">{stats.draft}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Completed</div>
            <div className="text-3xl font-bold text-blue-600">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-1">Target Revenue</div>
            <div className="text-2xl font-bold text-purple-600">
              ${stats.total_revenue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Campaigns
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'draft'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Drafts
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Campaigns List */}
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <BarChart3 className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first marketing campaign to start engaging with your audience
            </p>
            <Link
              href="/admin/campaigns/create"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const TypeIcon = typeIcons[campaign.type] || Mail
              
              return (
                <div
                  key={campaign.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <TypeIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColors[campaign.status]}`}>
                            {campaign.status.toUpperCase()}
                          </span>
                          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                            {typeLabels[campaign.type]}
                          </span>
                        </div>
                        
                        {campaign.description && (
                          <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>
                        )}
                        
                        <div className="flex gap-6 text-sm text-gray-500">
                          {campaign.actual_audience_size > 0 && (
                            <div>
                              <span className="font-medium">Audience:</span> {campaign.actual_audience_size.toLocaleString()}
                            </div>
                          )}
                          {campaign.target_revenue > 0 && (
                            <div>
                              <span className="font-medium">Target:</span> ${campaign.target_revenue.toLocaleString()}
                            </div>
                          )}
                          {campaign.start_date && (
                            <div>
                              <span className="font-medium">Start:</span> {new Date(campaign.start_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/campaigns/${campaign.id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title="View campaign"
                      >
                        <Eye className="w-5 h-5 text-gray-600" />
                      </Link>
                      
                      <Link
                        href={`/admin/campaigns/${campaign.id}/edit`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title="Edit campaign"
                      >
                        <Edit className="w-5 h-5 text-gray-600" />
                      </Link>

                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => updateCampaignStatus(campaign.id, 'active')}
                          className="p-2 hover:bg-green-100 rounded-lg transition"
                          title="Activate campaign"
                        >
                          <Play className="w-5 h-5 text-green-600" />
                        </button>
                      )}

                      {campaign.status === 'active' && (
                        <button
                          onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                          className="p-2 hover:bg-yellow-100 rounded-lg transition"
                          title="Pause campaign"
                        >
                          <Pause className="w-5 h-5 text-yellow-600" />
                        </button>
                      )}

                      <button
                        onClick={() => deleteCampaign(campaign.id, campaign.name)}
                        className="p-2 hover:bg-red-100 rounded-lg transition"
                        title="Delete campaign"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}