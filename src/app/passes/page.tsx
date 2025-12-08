'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Check, Ticket, ArrowLeft, Loader2, Star } from 'lucide-react'

interface PassType {
  id: string
  name: string
  description: string
  credits: number
  price: number
  currency: string
  validity_days: number | null
  sort_order: number
}

export default function PassesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [passTypes, setPassTypes] = useState<PassType[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    fetchPassTypes()
  }, [])

  const fetchPassTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('pass_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      setPassTypes(data || [])
    } catch (error) {
      console.error('Error fetching passes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (passType: PassType) => {
    if (!user) {
      router.push('/')
      return
    }

    setPurchasing(passType.id)

    try {
      const response = await fetch('/api/checkout-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passTypeId: passType.id,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Failed to start checkout')
      setPurchasing(null)
    }
  }

  const getValidityText = (days: number | null) => {
    if (!days) return 'Never expires'
    if (days === 30) return '30 days'
    if (days === 90) return '3 months'
    if (days === 180) return '6 months'
    if (days === 365) return '1 year'
    return `${days} days`
  }

  const getSavingsPercent = (credits: number, price: number) => {
    const regularPrice = credits * 15 // Assuming $15 per event
    const savings = ((regularPrice - price) / regularPrice) * 100
    return Math.round(savings)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Passes</h1>
              <p className="text-gray-600 mt-1">Save money with multi-event passes</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!user && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <p className="text-yellow-800 font-medium">
              Please sign in to purchase passes
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {passTypes.map((passType, index) => {
            const isPopular = index === 1
            const savings = getSavingsPercent(passType.credits, passType.price)

            return (
              <div
                key={passType.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
                  isPopular ? 'border-indigo-500 scale-105' : 'border-gray-200'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {passType.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    {passType.description}
                  </p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        ${passType.price}
                      </span>
                      <span className="text-gray-500">{passType.currency}</span>
                    </div>
                    {savings > 0 && (
                      <div className="mt-2 inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Save {savings}%
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">
                        {passType.credits === 999 ? 'Unlimited' : passType.credits} event
                        {passType.credits !== 1 ? 's' : ''}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">
                        Valid for {getValidityText(passType.validity_days)}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">
                        Attend any events
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">
                        Transferable credits
                      </span>
                    </li>
                  </ul>

                  <button
                    onClick={() => handlePurchase(passType)}
                    disabled={!user || purchasing === passType.id}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                      isPopular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                  >
                    {purchasing === passType.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Purchase Pass'
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 bg-indigo-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How Passes Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-3">🎫</div>
              <h3 className="font-semibold text-gray-900 mb-2">Purchase Pass</h3>
              <p className="text-gray-600 text-sm">
                Choose the pass that fits your schedule and save money
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">✅</div>
              <h3 className="font-semibold text-gray-900 mb-2">Attend Events</h3>
              <p className="text-gray-600 text-sm">
                Use your pass credits at any event - no individual tickets needed
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Track Usage</h3>
              <p className="text-gray-600 text-sm">
                View remaining credits and redemption history in your dashboard
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}