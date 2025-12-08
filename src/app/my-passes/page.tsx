'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Ticket, Calendar, ArrowLeft, Loader2, Clock, CheckCircle } from 'lucide-react'

interface UserPass {
  id: string
  credits_remaining: number
  credits_total: number
  purchase_date: string
  expiry_date: string | null
  status: string
  amount_paid: number
  pass_type_id: string
  pass_types: {
    name: string
    description: string
  }
}

interface PassRedemption {
  id: string
  credits_used: number
  redeemed_at: string
  events: {
    title: string
    start_datetime: string
  }
}

export default function MyPassesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [passes, setPasses] = useState<UserPass[]>([])
  const [redemptions, setRedemptions] = useState<PassRedemption[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPass, setSelectedPass] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    } else if (user) {
      fetchPasses()
    }
  }, [user, authLoading, router])

  const fetchPasses = async () => {
    try {
      // Fetch user passes
      const { data: passesData, error: passesError } = await supabase
        .from('user_passes')
        .select(`
          *,
          pass_types (name, description)
        `)
        .eq('user_id', user?.id)
        .order('purchase_date', { ascending: false })

      if (passesError) throw passesError
      setPasses(passesData || [])

      // Fetch redemption history
      const { data: redemptionsData, error: redemptionsError } = await supabase
        .from('pass_redemptions')
        .select(`
          *,
          events (title, start_datetime)
        `)
        .eq('user_id', user?.id)
        .order('redeemed_at', { ascending: false })
        .limit(10)

      if (redemptionsError) throw redemptionsError
      setRedemptions(redemptionsData || [])
    } catch (error) {
      console.error('Error fetching passes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      depleted: 'bg-gray-100 text-gray-800',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const text = {
      active: 'Active',
      expired: 'Expired',
      depleted: 'Used Up',
    }
    return text[status as keyof typeof text] || status
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
          <div className="flex items-center gap-3">
            <Ticket className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Passes</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {passes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Passes Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Purchase a pass to save money on multiple events!
            </p>
            <Link
              href="/passes"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Passes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Passes */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Your Passes</h2>
              
              {passes.map((pass) => (
                <div
                  key={pass.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {pass.pass_types.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {pass.pass_types.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(pass.status)}`}>
                      {getStatusText(pass.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <p className="text-sm text-indigo-600 font-medium mb-1">Credits Remaining</p>
                      <p className="text-3xl font-bold text-indigo-900">
                        {pass.credits_remaining}
                      </p>
                      <p className="text-xs text-indigo-600 mt-1">
                        of {pass.credits_total} total
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 font-medium mb-1">Expires</p>
                      <p className="text-lg font-bold text-gray-900">
                        {pass.expiry_date
                          ? new Date(pass.expiry_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Never'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      Purchased {new Date(pass.purchase_date).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => setSelectedPass(selectedPass === pass.id ? null : pass.id)}
                      className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                    >
                      {selectedPass === pass.id ? 'Hide History' : 'View History'}
                    </button>
                  </div>

                  {selectedPass === pass.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Redemption History</h4>
                      {redemptions.filter(r => r.user_pass_id === pass.id).length === 0 ? (
                        <p className="text-sm text-gray-500">No redemptions yet</p>
                      ) : (
                        <div className="space-y-2">
                          {redemptions
                            .filter(r => r.user_pass_id === pass.id)
                            .map((redemption) => (
                              <div
                                key={redemption.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-gray-700">{redemption.events.title}</span>
                                </div>
                                <span className="text-gray-500">
                                  {new Date(redemption.redeemed_at).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Passes</span>
                    <span className="font-bold text-gray-900">
                      {passes.filter(p => p.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Credits</span>
                    <span className="font-bold text-gray-900">
                      {passes.reduce((sum, p) => sum + p.credits_remaining, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Events Attended</span>
                    <span className="font-bold text-gray-900">
                      {redemptions.length}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/passes"
                className="block w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors text-center"
              >
                Buy Another Pass
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}