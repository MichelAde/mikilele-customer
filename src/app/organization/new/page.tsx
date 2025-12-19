'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Building2, Mail, Phone, MapPin, Globe, CreditCard, CheckCircle } from 'lucide-react'

export default function OrganizationSignupPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [orgData, setOrgData] = useState({
    name: '',
    subdomain: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    country: 'Canada',
    website: '',
    instagram: '',
    subscriptionTier: 'free'
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit() {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to create an organization')
        return
      }

      // Check if subdomain is available
      const { data: existing } = await supabase
        .from('organization')
        .select('id')
        .eq('subdomain', orgData.subdomain.toLowerCase())
        .single()

      if (existing) {
        setError('This subdomain is already taken. Please choose another.')
        return
      }

      // Create organization
      const { data: newOrg, error: orgError } = await supabase
        .from('organization')
        .insert({
          name: orgData.name,
          subdomain: orgData.subdomain.toLowerCase(),
          email: orgData.email,
          phone: orgData.phone,
          address: orgData.address,
          city: orgData.city,
          province: orgData.province,
          country: orgData.country,
          website_url: orgData.website,
          instagram: orgData.instagram,
          subscription_tier: orgData.subscriptionTier,
          is_active: true
        })
        .select()
        .single()

      if (orgError) throw orgError

      // Add user as owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: newOrg.id,
          user_id: user.id,
          role: 'owner',
          permissions: { all: true }
        })

      if (memberError) throw memberError

      // Success!
      router.push(`/admin?org=${newOrg.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function generateSubdomain(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Create Your Organization</h1>
          <p className="text-gray-600">
            Start managing events, classes, and campaigns in minutes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="font-medium">Organization Info</span>
          </div>
          <div className="w-16 h-1 bg-gray-200"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="font-medium">Contact Details</span>
          </div>
          <div className="w-16 h-1 bg-gray-200"></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200'
            }`}>
              3
            </div>
            <span className="font-medium">Plan</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Organization Info */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6">Organization Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name *
                </label>
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={orgData.name}
                    onChange={(e) => {
                      setOrgData({ 
                        ...orgData, 
                        name: e.target.value,
                        subdomain: orgData.subdomain || generateSubdomain(e.target.value)
                      })
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="e.g., Mikilele Events"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain *
                </label>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div className="flex-1 flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <input
                      type="text"
                      value={orgData.subdomain}
                      onChange={(e) => setOrgData({ ...orgData, subdomain: e.target.value })}
                      className="flex-1 px-4 py-2 focus:outline-none"
                      placeholder="your-organization"
                    />
                    <span className="px-4 py-2 bg-gray-100 text-gray-600 text-sm">
                      .myplatform.com
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This will be your unique URL: {orgData.subdomain || 'your-org'}.myplatform.com
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram Handle
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">@</span>
                  <input
                    type="text"
                    value={orgData.instagram}
                    onChange={(e) => setOrgData({ ...orgData, instagram: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="your.events"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  value={orgData.website}
                  onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!orgData.name || !orgData.subdomain}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Contact Details */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={orgData.email}
                    onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="contact@yourorg.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={orgData.phone}
                    onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Venue Address
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={orgData.address}
                    onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="1099 Maitland Avenue"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={orgData.city}
                    onChange={(e) => setOrgData({ ...orgData, city: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={orgData.province}
                    onChange={(e) => setOrgData({ ...orgData, province: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Province/State"
                  />
                  <input
                    type="text"
                    value={orgData.country}
                    onChange={(e) => setOrgData({ ...orgData, country: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!orgData.email || !orgData.phone}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Plan Selection */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Free Plan */}
              <div 
                onClick={() => setOrgData({ ...orgData, subscriptionTier: 'free' })}
                className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                  orgData.subscriptionTier === 'free' 
                    ? 'border-purple-600 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Free</h3>
                  {orgData.subscriptionTier === 'free' && (
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <p className="text-3xl font-bold mb-2">$0<span className="text-lg text-gray-600">/mo</span></p>
                <p className="text-sm text-gray-600 mb-4">Perfect to get started</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>10 events/month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Basic features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Email support</span>
                  </li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div 
                onClick={() => setOrgData({ ...orgData, subscriptionTier: 'pro' })}
                className={`border-2 rounded-lg p-6 cursor-pointer transition relative ${
                  orgData.subscriptionTier === 'pro' 
                    ? 'border-purple-600 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    POPULAR
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Pro</h3>
                  {orgData.subscriptionTier === 'pro' && (
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <p className="text-3xl font-bold mb-2">$29<span className="text-lg text-gray-600">/mo</span></p>
                <p className="text-sm text-gray-600 mb-4">For growing organizations</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Unlimited events</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>All features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>

              {/* Enterprise Plan */}
              <div 
                onClick={() => setOrgData({ ...orgData, subscriptionTier: 'enterprise' })}
                className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                  orgData.subscriptionTier === 'enterprise' 
                    ? 'border-purple-600 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Enterprise</h3>
                  {orgData.subscriptionTier === 'enterprise' && (
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <p className="text-3xl font-bold mb-2">$99<span className="text-lg text-gray-600">/mo</span></p>
                <p className="text-sm text-gray-600 mb-4">For large organizations</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Custom domain</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>White-label</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 font-medium"
              >
                {loading ? 'Creating Organization...' : 'Create Organization'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}