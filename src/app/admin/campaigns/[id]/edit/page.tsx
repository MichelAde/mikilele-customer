'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  Mail, 
  MessageSquare, 
  Phone,
  Users,
  Save,
  Play,
  Trash2,
  Target
} from 'lucide-react'

interface Campaign {
  id: string
  name: string
  description: string
  type: string
  status: string
  goal: string
  actual_audience_size: number
}

interface CampaignStep {
  id: string
  step_number: number
  name: string
  type: string
  channel: string
  delay_days: number
  delay_hours: number
  subject_line: string
  content: string
  cta_text: string
  cta_url: string
}

interface Segment {
  id: string
  name: string
  description: string
  estimated_size: number
  is_dynamic: boolean
}

interface CampaignAudience {
  id: string
  segment_id: string
  segments: Segment
}

export default function EditCampaign() {
  const params = useParams()
  const campaignId = params.id as string
  const router = useRouter()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [steps, setSteps] = useState<CampaignStep[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [selectedSegments, setSelectedSegments] = useState<CampaignAudience[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddStep, setShowAddStep] = useState(false)
  const [showAddSegment, setShowAddSegment] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchCampaign()
    fetchSteps()
    fetchSegments()
    fetchCampaignAudiences()
  }, [campaignId])

  async function fetchCampaign() {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      if (error) throw error
      setCampaign(data)
    } catch (error) {
      console.error('Error fetching campaign:', error)
      alert('Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  async function fetchSteps() {
    try {
      const { data, error } = await supabase
        .from('campaign_steps')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('step_number', { ascending: true })

      if (error) throw error
      setSteps(data || [])
    } catch (error) {
      console.error('Error fetching steps:', error)
    }
  }

  async function fetchSegments() {
    try {
      const { data, error } = await supabase
        .from('audience_segments')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setSegments(data || [])
    } catch (error) {
      console.error('Error fetching segments:', error)
    }
  }

  async function fetchCampaignAudiences() {
    try {
      const { data, error } = await supabase
        .from('campaign_audiences')
        .select('*, segments:segment_id(*)')
        .eq('campaign_id', campaignId)

      if (error) throw error
      setSelectedSegments(data || [])
    } catch (error) {
      console.error('Error fetching campaign audiences:', error)
    }
  }

  async function addSegmentToCampaign(segmentId: string) {
    try {
      // Check if already added
      if (selectedSegments.some(sa => sa.segment_id === segmentId)) {
        alert('This segment is already added to the campaign')
        return
      }

      const segment = segments.find(s => s.id === segmentId)
      
      const { data, error } = await supabase
        .from('campaign_audiences')
        .insert({
          campaign_id: campaignId,
          segment_id: segmentId,
          estimated_size: segment?.estimated_size || 0
        })
        .select('*, segments:segment_id(*)')
        .single()

      if (error) throw error

      setSelectedSegments([...selectedSegments, data])
      setShowAddSegment(false)
      
      // Update campaign total audience size
      await updateCampaignAudienceSize()
    } catch (error) {
      console.error('Error adding segment:', error)
      alert('Failed to add segment')
    }
  }

  async function removeSegmentFromCampaign(audienceId: string) {
    if (!confirm('Remove this segment from the campaign?')) return

    try {
      const { error } = await supabase
        .from('campaign_audiences')
        .delete()
        .eq('id', audienceId)

      if (error) throw error

      setSelectedSegments(selectedSegments.filter(sa => sa.id !== audienceId))
      
      // Update campaign total audience size
      await updateCampaignAudienceSize()
    } catch (error) {
      console.error('Error removing segment:', error)
      alert('Failed to remove segment')
    }
  }

  async function updateCampaignAudienceSize() {
    try {
      const { data, error } = await supabase
        .from('campaign_audiences')
        .select('estimated_size')
        .eq('campaign_id', campaignId)

      if (error) throw error

      const totalSize = data.reduce((sum, item) => sum + (item.estimated_size || 0), 0)

      await supabase
        .from('campaigns')
        .update({ actual_audience_size: totalSize })
        .eq('id', campaignId)

      if (campaign) {
        setCampaign({ ...campaign, actual_audience_size: totalSize })
      }
    } catch (error) {
      console.error('Error updating audience size:', error)
    }
  }

  async function addStep(stepType: string, channel: string) {
    try {
      const newStepNumber = steps.length + 1

      const { data, error } = await supabase
        .from('campaign_steps')
        .insert({
          campaign_id: campaignId,
          step_number: newStepNumber,
          name: `Step ${newStepNumber}`,
          type: stepType,
          channel: channel,
          delay_days: 0,
          delay_hours: 0,
          subject_line: '',
          content: '',
          cta_text: '',
          cta_url: ''
        })
        .select()
        .single()

      if (error) throw error

      setSteps([...steps, data])
      setShowAddStep(false)
    } catch (error) {
      console.error('Error adding step:', error)
      alert('Failed to add step')
    }
  }

  async function updateStep(stepId: string, updates: Partial<CampaignStep>) {
    try {
      const { error } = await supabase
        .from('campaign_steps')
        .update(updates)
        .eq('id', stepId)

      if (error) throw error

      setSteps(steps.map(s => s.id === stepId ? { ...s, ...updates } : s))
    } catch (error) {
      console.error('Error updating step:', error)
      alert('Failed to update step')
    }
  }

  async function deleteStep(stepId: string) {
    if (!confirm('Are you sure you want to delete this step?')) return

    try {
      const { error } = await supabase
        .from('campaign_steps')
        .delete()
        .eq('id', stepId)

      if (error) throw error

      const updatedSteps = steps.filter(s => s.id !== stepId)
      
      // Renumber remaining steps
      for (let i = 0; i < updatedSteps.length; i++) {
        updatedSteps[i].step_number = i + 1
        await supabase
          .from('campaign_steps')
          .update({ step_number: i + 1 })
          .eq('id', updatedSteps[i].id)
      }

      setSteps(updatedSteps)
    } catch (error) {
      console.error('Error deleting step:', error)
      alert('Failed to delete step')
    }
  }

  async function activateCampaign() {
    if (steps.length === 0) {
      alert('Please add at least one step before activating the campaign')
      return
    }

    if (selectedSegments.length === 0) {
      alert('Please select at least one audience segment before activating')
      return
    }

    if (!confirm('Are you sure you want to activate this campaign?')) return

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', campaignId)

      if (error) throw error

      alert('Campaign activated successfully!')
      router.push('/admin/campaigns')
    } catch (error) {
      console.error('Error activating campaign:', error)
      alert('Failed to activate campaign')
    }
  }

  const channelIcons = {
    resend_email: Mail,
    twilio_sms: MessageSquare,
    twilio_whatsapp: Phone,
  }

  const channelLabels = {
    resend_email: 'Email',
    twilio_sms: 'SMS',
    twilio_whatsapp: 'WhatsApp',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Campaign Not Found</h2>
          <Link href="/admin/campaigns" className="text-purple-600 hover:text-purple-700">
            Back to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  const totalAudience = selectedSegments.reduce((sum, sa) => sum + (sa.segments?.estimated_size || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
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
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
            <p className="text-gray-600">Build your campaign sequence</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={activateCampaign}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              <Play className="w-5 h-5" />
              Activate Campaign
            </button>
          </div>
        </div>

        {/* Audience Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-semibold">Target Audience</h2>
                <p className="text-sm text-gray-600">Select which segments to target</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">
                {totalAudience.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Recipients</div>
            </div>
          </div>

          {/* Selected Segments */}
          {selectedSegments.length > 0 && (
            <div className="space-y-2 mb-4">
              {selectedSegments.map((sa) => (
                <div
                  key={sa.id}
                  className="flex items-center justify-between bg-purple-50 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-semibold">{sa.segments?.name}</div>
                      {sa.segments?.description && (
                        <div className="text-sm text-gray-600">{sa.segments.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-purple-600">
                        {sa.segments?.estimated_size?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-gray-500">people</div>
                    </div>
                    <button
                      onClick={() => removeSegmentFromCampaign(sa.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Segment Button/Selector */}
          {!showAddSegment ? (
            <button
              onClick={() => setShowAddSegment(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-purple-500 hover:text-purple-600 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Audience Segment
            </button>
          ) : (
            <div className="border-2 border-purple-300 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Select Segment</h3>
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {segments
                  .filter(s => !selectedSegments.some(sa => sa.segment_id === s.id))
                  .map((segment) => (
                    <button
                      key={segment.id}
                      onClick={() => addSegmentToCampaign(segment.id)}
                      className="w-full text-left p-3 border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{segment.name}</div>
                          {segment.description && (
                            <div className="text-sm text-gray-600">{segment.description}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-600">
                            {segment.estimated_size?.toLocaleString() || '0'}
                          </div>
                          <div className="text-xs text-gray-500">people</div>
                        </div>
                      </div>
                    </button>
                  ))}
                {segments.filter(s => !selectedSegments.some(sa => sa.segment_id === s.id)).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No more segments available. <Link href="/admin/campaigns/segments/create" className="text-purple-600 hover:underline">Create one?</Link>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowAddSegment(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Campaign Steps */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            Campaign Sequence
          </h2>
          
          {steps.map((step, index) => {
            const Icon = channelIcons[step.channel as keyof typeof channelIcons] || Mail
            
            return (
              <div key={step.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-100 p-3 rounded-lg mb-2">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-300"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-purple-600">
                          STEP {step.step_number}
                        </span>
                        <span className="text-sm px-3 py-1 rounded-full bg-gray-100">
                          {channelLabels[step.channel as keyof typeof channelLabels]}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteStep(step.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Delay Settings */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Delay (Days)</label>
                        <input
                          type="number"
                          value={step.delay_days}
                          onChange={(e) => updateStep(step.id, { delay_days: parseInt(e.target.value) || 0 })}
                          className="w-full border rounded-lg px-3 py-2"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Delay (Hours)</label>
                        <input
                          type="number"
                          value={step.delay_hours}
                          onChange={(e) => updateStep(step.id, { delay_hours: parseInt(e.target.value) || 0 })}
                          className="w-full border rounded-lg px-3 py-2"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Email Subject (for email channel) */}
                    {step.channel === 'resend_email' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Subject Line</label>
                        <input
                          type="text"
                          value={step.subject_line}
                          onChange={(e) => updateStep(step.id, { subject_line: e.target.value })}
                          placeholder="Enter email subject..."
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                    )}

                    {/* Message Content */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Message Content</label>
                      <textarea
                        value={step.content}
                        onChange={(e) => updateStep(step.id, { content: e.target.value })}
                        placeholder="Enter your message..."
                        rows={6}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Call to Action */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">CTA Button Text</label>
                        <input
                          type="text"
                          value={step.cta_text}
                          onChange={(e) => updateStep(step.id, { cta_text: e.target.value })}
                          placeholder="Buy Tickets"
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">CTA URL</label>
                        <input
                          type="url"
                          value={step.cta_url}
                          onChange={(e) => updateStep(step.id, { cta_url: e.target.value })}
                          placeholder="https://..."
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Step Button */}
        {!showAddStep ? (
          <button
            onClick={() => setShowAddStep(true)}
            className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-gray-500 hover:border-purple-500 hover:text-purple-600 transition"
          >
            <Plus className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Add Step to Campaign</p>
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Choose Channel</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <button
                onClick={() => addStep('email', 'resend_email')}
                className="p-6 border-2 rounded-lg hover:border-purple-500 transition"
              >
                <Mail className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="font-semibold">Email</p>
              </button>
              <button
                onClick={() => addStep('sms', 'twilio_sms')}
                className="p-6 border-2 rounded-lg hover:border-purple-500 transition"
              >
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="font-semibold">SMS</p>
              </button>
              <button
                onClick={() => addStep('whatsapp', 'twilio_whatsapp')}
                className="p-6 border-2 rounded-lg hover:border-purple-500 transition"
              >
                <Phone className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <p className="font-semibold">WhatsApp</p>
              </button>
            </div>
            <button
              onClick={() => setShowAddStep(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}