'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'

export default function CalculateAllSegments() {
  const [calculating, setCalculating] = useState(false)
  const [results, setResults] = useState<any[]>([])

  async function calculateAll() {
    setCalculating(true)
    setResults([])

    try {
      const response = await fetch('/api/segments/calculate', {
        method: 'GET'
      })

      const data = await response.json()

      if (data.success) {
        setResults(data.segments)
      } else {
        alert('Calculation failed: ' + data.error)
      }
    } catch (error: any) {
      console.error('Error:', error)
      alert('Failed to calculate segments')
    } finally {
      setCalculating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/admin/campaigns/segments"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Segments
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-2">Calculate All Segments</h1>
          <p className="text-gray-600 mb-8">
            Recalculate audience size for all segments
          </p>

          <button
            onClick={calculateAll}
            disabled={calculating}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {calculating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Calculate All Segments
              </>
            )}
          </button>

          {results.length > 0 && (
            <div className="mt-8 space-y-3">
              <h3 className="font-semibold text-lg">Results:</h3>
              {results.map((result) => (
                <div key={result.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <span className="font-medium">{result.name}</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {result.size.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}