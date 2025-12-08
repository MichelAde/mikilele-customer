'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2, Calendar } from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      setLoading(false)
    } else {
      router.push('/classes/packages')
    }
  }, [sessionId, router])

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
          Package Purchased! 🎉
        </h1>
        
        <p className="text-gray-600 mb-2">
          Your class package has been activated!
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          You can now book classes and start your dance journey.
        </p>

        <div className="space-y-3">
          <Link
            href="/classes/my-classes"
            className="block w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              View My Classes
            </div>
          </Link>
          
          <Link
            href="/classes"
            className="block w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Browse Classes
          </Link>
          
          {sessionId && (
            <p className="text-xs text-gray-400 mt-4">
              Order ID: {sessionId.slice(0, 20)}...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ClassSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}