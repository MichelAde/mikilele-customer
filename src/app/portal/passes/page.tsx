'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { CreditCard, Calendar, CheckCircle, XCircle } from 'lucide-react'

interface Pass {
  id: string
  pass_type_id: string
  credits_remaining: number
  credits_total: number
  expiry_date: string
  status: string
  pass_types: {
    name: string
    type: string
    description: string
  }
}

export default function MyPassesPage() {
  const [passes, setPasses] = useState<Pass[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
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
            description
          )
        `)
        .eq('user_id', user.id)
        .order('expiry_date', { ascending: true })

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
        <p className="text-gray-600">View and manage your class passes</p>
      </div>

      {passes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No active passes
          </h3>
          <p className="text-gray-600 mb-6">
            You do not have any class passes yet.
          </p>
          <a
            href="/passes"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            Browse Passes
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passes.map((pass) => {
            const isActive = pass.status === 'active'
            const isExpired = new Date(pass.expiry_date) < new Date()
            const creditsPercent = (pass.credits_remaining / pass.credits_total) * 100

            return (
              <div
                key={pass.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {pass.pass_types?.name || 'Class Pass'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {pass.pass_types?.type || 'Regular'}
                    </p>
                  </div>
                  {isActive && !isExpired ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Credits</span>
                    <span className="text-sm font-bold text-purple-600">
                      {pass.credits_remaining} / {pass.credits_total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${creditsPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Expires: {new Date(pass.expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isActive && !isExpired
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isActive && !isExpired ? 'Active' : 'Expired'}
                  </span>
                </div>

                {pass.pass_types?.description && (
                  <p className="text-sm text-gray-600 mt-4">
                    {pass.pass_types.description}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}