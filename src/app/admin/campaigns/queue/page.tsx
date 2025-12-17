'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, RefreshCw } from 'lucide-react'

export default function CampaignQueue() {
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function processQueue() {
    setProcessing(true)
    setResult(null)

    try {
      const response = await fetch('/api/campaigns/process-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'dev-secret'}`
        }
      })

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/admin/campaigns"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-2">Campaign Queue</h1>
          <p className="text-gray-600 mb-8">
            Manually process pending campaign sends (runs automatically every 5 minutes)
          </p>

          <button
            onClick={processQueue}
            disabled={processing}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {processing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Process Queue Now
              </>
            )}
          </button>

          {result && (
            <div className={`mt-6 p-6 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className="font-semibold mb-2">
                {result.success ? '✅ Queue Processed Successfully' : '❌ Processing Failed'}
              </h3>
              
              {result.success && result.stats && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Pending:</span>
                    <span className="font-bold">{result.stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processed:</span>
                    <span className="font-bold text-green-600">{result.stats.processed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Failed:</span>
                    <span className="font-bold text-red-600">{result.stats.failed}</span>
                  </div>
                </div>
              )}

              {result.error && (
                <p className="text-red-600 mt-2">{result.error}</p>
              )}
            </div>
          )}

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">How It Works</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• When you activate a campaign, all sends are queued with their scheduled times</li>
              <li>• The queue processor runs every 5 minutes via Vercel Cron</li>
              <li>• Sends with delays are scheduled for future processing</li>
              <li>• Use this page to manually trigger processing for testing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
