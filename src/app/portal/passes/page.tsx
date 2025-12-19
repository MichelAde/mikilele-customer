'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { CreditCard, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Pass {
  id: string
  pass_type_id: string
  credits_remaining: number
  credits_total: number
  expires_at: string
  is_active: boolean
  created_at: string
  pass_types: {
    name: string
    type: string
    description: string
    organization: {
      name: string
    }
  }
}

export default function MyPassesPage() {
  const [passes, setPasses] = useState<Pass[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchPasses()
  }, [])

  async function fetchPasses() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_passes')
        .select(`
          *,
          pass_types (
            name,
            type,
            description,
            organization (name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching passes:', error)
      } else {
        setPasses(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  function getPassStatus(pass: Pass) {
    if (!pass.is_active) return 'inactive'
    
    const now = new Date()
    const expiresAt = new Date(pass.expires_at)
    
    if (expiresAt < now) return 'expired'
    if (pass.credits_remaining === 0) return 'used'
    
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntilExpiry <= 7) return 'expiring'
    
    return 'active'
  }

  function getStatusBadge(status: string) {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active', icon: CheckCircle },
      expiring: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Expiring Soon', icon: AlertCircle },
      expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expired', icon: XCircle },
      used: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Fully Used', icon: CheckCircle },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive', icon: XCircle }
    }
    
    const badge = badges[status as keyof typeof badges]
    const Icon = badge.icon
    
    return (
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    )
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Passes</h1>
        <p className="text-gray-600">Manage your multi-event passes</p>
      </div>

      {passes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No passes yet</h3>
          <p className="text-gray-600 mb-6">
            Save money with multi-event passes!
          </p>
          <Link
            href="/passes"
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Browse Passes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {passes.map((pass) => {
            const status = getPassStatus(pass)
            const creditsUsed = pass.credits_total - pass.credits_remaining
            const usagePercent = (creditsUsed / pass.credits_total) * 100

            return (
              <div key={pass.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {pass.pass_types.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {pass.pass_types.organization?.name}
                      </p>
                    </div>
                    {getStatusBadge(status)}
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {pass.pass_types.description}
                  </p>

                  {/* Credits Usage Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Credits Used</span>
                      <span className="font-semibold">
                        {creditsUsed} / {pass.credits_total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${usagePercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Credits Remaining</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {pass.credits_remaining}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Expires</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(pass.expires_at)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {status === 'active' || status === 'expiring' ? (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <Link
                        href="/events"
                        className="block text-center bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition font-medium"
                      >
                        Use Pass for Events
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Purchase More Passes */}
      {passes.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Want more passes?</h3>
          <p className="mb-4 opacity-90">Save even more with our multi-event passes</p>
          <Link
            href="/passes"
            className="inline-block bg-white text-purple-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Browse All Passes
          </Link>
        </div>
      )}
    </div>
  )
}