'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Mail, MessageSquare, Calendar, TrendingUp, BarChart3 } from 'lucide-react'

interface CampaignData {
  name: string
  description: string
  type: string
  goal: string
  target_revenue: string
  start_date: string
  end_date: string
}

export default function CreateCampaign() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    description: '',
    type: 'email',
    goal: 'sales',
    target_revenue: '',
    start_date: '',
    end_date: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const campaignTypes = [
    {
      value: 'email',
      label: 'Email Campaign',
      description: 'Send targeted emails to your audience',
      icon: Mail,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      value: 'multi_channel',
      label: 'Multi-Channel',
      description: 'Reach customers via email, SMS, WhatsApp & social',
      icon: MessageSquare,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      value: 'event_promo',
      label: 'Event Promotion',
      description: 'Promote upcoming events with countdown sequences',
      icon: Calendar,
      color: 'bg-pink-100 text-pink-600'
    },
    {
      value: 'seasonal',
      label: 'Seasonal Campaign',
      description: 'Holiday specials and seasonal promotions',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600'
    },
    {
      value: 're_engagement',
      label: 'Re-engagement',
      description: 'Win back inactive customers',
      icon: BarChart3,
      color: 'bg-orange-100 text-orange-600'
    }
  ]

  const goals = [
    { value: 'sales', label: 'Drive Sales', description: 'Increase ticket and pass purchases' },
    { value: 'engagement', label: 'Boost Engagement', description: 'Get more opens and clicks' },
    { value: 'awareness', label: 'Build Awareness', description: 'Reach new audiences' },
    { value: 'retention', label: 'Retain Customers', description: 'Keep customers coming back' }
  ]

  function updateField(field: keyof CampaignData, value: string) {
    setCampaignData(prev => ({ ...prev, [field]: value }))
  }

  function canProceed() {
    if (step === 1) {
      return campaignData.name.trim() !== '' && campaignData.type !== ''
    }
    if (step === 2) {
      return campaignData.goal !== ''
    }
    return true
  }

  async function createCampaign() {
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('You must be logged in to create a campaign')
        return
      }

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          name: campaignData.name,
          description: campaignData.description,
          type: campaignData.type,
          goal: campaignData.goal,
          target_revenue: campaignData.target_revenue ? parseFloat(campaignData.target_revenue) : null,
          start_date: campaignData.start_date || null,
          end_date: campaignData.end_date || null,
          status: 'draft',
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error

      alert('Campaign created successfully!')
      router.push(`/admin/campaigns/${data.id}/edit`)
    } catch (error: any) {
      console.error('Error creating campaign:', error)
      alert('Failed to create campaign: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const totalSteps = 3

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Campaign</h1>
          <p className="text-gray-600">Follow the steps to set up your marketing campaign</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                    i < step
                      ? 'bg-green-600 text-white'
                      : i === step
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i < step ? <Check className="w-5 h-5" /> : i}
                </div>
                {i < totalSteps && (
                  <div
                    className={`w-20 h-1 transition ${
                      i < step ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-24 mt-2">
            <span className={`text-sm ${step === 1 ? 'font-semibold text-purple-600' : 'text-gray-500'}`}>
              Campaign Details
            </span>
            <span className={`text-sm ${step === 2 ? 'font-semibold text-purple-600' : 'text-gray-500'}`}>
              Goals & Targeting
            </span>
            <span className={`text-sm ${step === 3 ? 'font-semibold text-purple-600' : 'text-gray-500'}`}>
              Schedule
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Campaign Details</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Campaign Name *</label>
                  <input
                    type="text"
                    value={campaignData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="e.g., Spring Dance Workshop Series"
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Description (optional)</label>
                  <textarea
                    value={campaignData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe your campaign..."
                    rows={3}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Campaign Type *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaignTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.value}
                          onClick={() => updateField('type', type.value)}
                          className={`p-4 border-2 rounded-lg text-left transition ${
                            campaignData.type === type.value
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${type.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold mb-1">{type.label}</h3>
                              <p className="text-sm text-gray-600">{type.description}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Goals & Targeting</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Campaign Goal *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {goals.map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => updateField('goal', goal.value)}
                        className={`p-4 border-2 rounded-lg text-left transition ${
                          campaignData.goal === goal.value
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h3 className="font-semibold mb-1">{goal.label}</h3>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {campaignData.goal === 'sales' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Revenue (optional)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500">$</span>
                      <input
                        type="number"
                        value={campaignData.target_revenue}
                        onChange={(e) => updateField('target_revenue', e.target.value)}
                        placeholder="5000"
                        className="w-full border rounded-lg pl-8 pr-4 py-3 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Schedule</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date (optional)</label>
                    <input
                      type="date"
                      value={campaignData.start_date}
                      onChange={(e) => updateField('start_date', e.target.value)}
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">When should this campaign start?</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">End Date (optional)</label>
                    <input
                      type="date"
                      value={campaignData.end_date}
                      onChange={(e) => updateField('end_date', e.target.value)}
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">When should this campaign end?</p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-4">Campaign Summary</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Name:</dt>
                      <dd className="font-medium">{campaignData.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Type:</dt>
                      <dd className="font-medium capitalize">{campaignData.type.replace('_', ' ')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Goal:</dt>
                      <dd className="font-medium capitalize">{campaignData.goal}</dd>
                    </div>
                    {campaignData.target_revenue && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Target Revenue:</dt>
                        <dd className="font-medium">${parseFloat(campaignData.target_revenue).toLocaleString()}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {step < totalSteps ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-purple-600 text-white hover:bg-purple-700"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={createCampaign}
                disabled={loading || !canProceed()}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? 'Creating...' : 'Create Campaign'}
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}