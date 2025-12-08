'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Check, Ticket, ArrowLeft, Loader2, Star, Zap } from 'lucide-react'

interface ClassPackage {
  id: string
  name: string
  description: string
  credits: number
  price: number
  currency: string
  validity_days: number | null
  sort_order: number
}

export default function ClassPackagesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [packages, setPackages] = useState<ClassPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('class_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      setPackages(data || [])
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (pkg: ClassPackage) => {
    if (!user) {
      router.push('/')
      return
    }

    setPurchasing(pkg.id)

    try {
      const response = await fetch('/api/checkout-class-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
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
    if (days === 60) return '2 months'
    if (days === 90) return '3 months'
    return `${days} days`
  }

  const getPricePerClass = (credits: number, price: number) => {
    if (credits === 999) return 'Unlimited'
    return `$${(price / credits).toFixed(2)}/class`
  }

  const getSavingsPercent = (credits: number, price: number) => {
    if (credits === 999 || credits === 1) return null
    const regularPrice = credits * 25 // Assuming $25 per drop-in
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
            href="/classes"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Classes
          </Link>
          <div className="flex items-center gap-3">
            <Ticket className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Class Packages</h1>
              <p className="text-gray-600 mt-1">Save money with multi-class packages</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!user && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <p className="text-yellow-800 font-medium">
              Please sign in to purchase class packages
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg, index) => {
            const isPopular = index === 2
            const isBestValue = index === 3
            const savings = getSavingsPercent(pkg.credits, pkg.price)

            return (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
                  isBestValue ? 'border-purple-500 scale-105' : isPopular ? 'border-indigo-500' : 'border-gray-200'
                }`}
              >
                {isBestValue && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Zap className="w-4 h-4 fill-current" />
                      Best Value
                    </div>
                  </div>
                )}

                {isPopular && !isBestValue && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      Popular
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {pkg.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {pkg.description}
                  </p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        ${pkg.price}
                      </span>
                      <span className="text-gray-500">{pkg.currency}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {getPricePerClass(pkg.credits, pkg.price)}
                    </div>
                    {savings && (
                      <div className="mt-2 inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        Save {savings}%
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">
                        {pkg.credits === 999 ? 'Unlimited' : pkg.credits} class{pkg.credits !== 1 ? 'es' : ''}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">
                        Valid for {getValidityText(pkg.validity_days)}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">
                        All dance styles included
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">
                        All levels welcome
                      </span>
                    </li>
                  </ul>

                  <button
                    onClick={() => handlePurchase(pkg)}
                    disabled={!user || purchasing === pkg.id}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                      isBestValue
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : isPopular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                  >
                    {purchasing === pkg.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Purchase Package'
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-indigo-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Package Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-semibold text-gray-900 mb-2">Save Money</h3>
              <p className="text-gray-600 text-sm">
                The more classes you buy, the more you save per class
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">🗓️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
              <p className="text-gray-600 text-sm">
                Use your credits for any class, any time within the validity period
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-gray-600 text-sm">
                View remaining credits and attendance history in your dashboard
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}