'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const clearCart = useCartStore((state) => state.clearCart)
  const [loading, setLoading] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      clearCart()
      setLoading(false)
    } else {
      router.push('/')
    }
  }, [sessionId, clearCart, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-2">
          Thank you for your purchase!
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          You will receive a confirmation email with your tickets shortly.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse More Events
          </Link>
          
          {sessionId && (
            <p className="text-xs text-gray-400 mt-4">
              Order ID: {sessionId.slice(0, 25)}...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}