'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X, Save } from 'lucide-react'

interface Filter {
  id: string
  field: string
  operator: string
  value: string
}

export default function CreateSegment() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [segmentType, setSegmentType] = useState('custom')
  const [isDynamic, setIsDynamic] = useState(false)
  const [filters, setFilters] = useState<Filter[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const filterFields = [
    { value: 'has_purchased', label: 'Has Made Purchase', type: 'boolean' },
    { value: 'total_spent', label: 'Total Spent', type: 'number' },
    { value: 'total_events_attended', label: 'Events Attended', type: 'number' },
    { value: 'last_purchase_days_ago', label: 'Days Since Last Purchase', type: 'number' },
    { value: 'pass_type', label: 'Pass Type', type: 'select', options: ['all_access', 'monthly', 'single_event'] },
    { value: 'engagement_level', label: 'Engagement Level', type: 'select', options: ['active', 'at_risk', 'dormant', 'inactive'] },
    { value: 'email_opens', label: 'Email Opens', type: 'number' },
    { value: 'email_clicks', label: 'Email Clicks', type: 'number' },
  ]

  const operators = {
    boolean: [
      { value: 'equals', label: 'Is' }
    ],
    number: [
      { value: 'greater_than', label: 'Greater than' },
      { value: 'less_than', label: 'Less than' },
      { value: 'equals', label: 'Equals' },
      { value: 'between', label: 'Between' }
    ],
    select: [
      { value: 'equals', label: 'Is' },
      { value: 'not_equals', label: 'Is not' }
    ]
  }

  function addFilter() {
    setFilters([
      ...filters,
      { id: Date.now().toString(), field: '', operator: '', value: '' }
    ])
  }

  function updateFilter(id: string, updates: Partial<Filter>) {
    setFilters(filters.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  function removeFilter(id: string) {
    setFilters(filters.filter(f => f.id !== id))
  }

  async function createSegment() {
    if (!name.trim()) {
      alert('Please enter a segment name')
      return
    }

    if (filters.length === 0) {
      alert('Please add at least one filter')
      return
    }

    setLoading(true)

    try {
      // Convert filters to the format expected by the database
      const filterObject: any = {}
      filters.forEach(filter => {
        if (filter.field && filter.operator && filter.value) {
          filterObject[filter.field] = {
            operator: filter.operator,
            value: filter.value
          }
        }
      })

      const { data, error } = await supabase
        .from('audience_segments')
        .insert({
          name,
          description,
          segment_type: segmentType,
          filters: filterObject,
          is_dynamic: isDynamic,
          estimated_size: 0 // Will be calculated later
        })
        .select()
        .single()

      if (error) throw error

      alert('Segment created successfully!')
      router.push('/admin/campaigns/segments')
    } catch (error: any) {
      console.error('Error creating segment:', error)
      alert('Failed to create segment: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/admin/campaigns/segments"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Segments
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Audience Segment</h1>
          <p className="text-gray-600">Define filters to target specific groups of customers</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium mb-2">Segment Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., High-Value Customers"
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this segment..."
              rows={3}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Dynamic Segment Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="dynamic"
              checked={isDynamic}
              onChange={(e) => setIsDynamic(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="dynamic" className="text-sm font-medium">
              Dynamic Segment (automatically updates as data changes)
            </label>
          </div>

          {/* Filters */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={addFilter}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Filter
              </button>
            </div>

            {filters.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No filters added yet</p>
                <button
                  onClick={addFilter}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Add your first filter
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filters.map((filter, index) => {
                  const selectedField = filterFields.find(f => f.value === filter.field)
                  const availableOperators = selectedField
                    ? operators[selectedField.type as keyof typeof operators]
                    : []

                  return (
                    <div key={filter.id} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg">
                      {index > 0 && (
                        <div className="text-sm font-semibold text-purple-600 pt-2">AND</div>
                      )}
                      
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        {/* Field */}
                        <select
                          value={filter.field}
                          onChange={(e) => updateFilter(filter.id, { field: e.target.value, operator: '', value: '' })}
                          className="border rounded-lg px-3 py-2"
                        >
                          <option value="">Select field...</option>
                          {filterFields.map(field => (
                            <option key={field.value} value={field.value}>
                              {field.label}
                            </option>
                          ))}
                        </select>

                        {/* Operator */}
                        <select
                          value={filter.operator}
                          onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                          className="border rounded-lg px-3 py-2"
                          disabled={!filter.field}
                        >
                          <option value="">Select operator...</option>
                          {availableOperators.map(op => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </select>

                        {/* Value */}
                        {selectedField?.type === 'select' ? (
                          <select
                            value={filter.value}
                            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                            className="border rounded-lg px-3 py-2"
                            disabled={!filter.operator}
                          >
                            <option value="">Select value...</option>
                            {selectedField.options?.map(opt => (
                              <option key={opt} value={opt}>
                                {opt.replace('_', ' ').toUpperCase()}
                              </option>
                            ))}
                          </select>
                        ) : selectedField?.type === 'boolean' ? (
                          <select
                            value={filter.value}
                            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                            className="border rounded-lg px-3 py-2"
                            disabled={!filter.operator}
                          >
                            <option value="">Select...</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        ) : (
                          <input
                            type={selectedField?.type === 'number' ? 'number' : 'text'}
                            value={filter.value}
                            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                            placeholder="Enter value..."
                            className="border rounded-lg px-3 py-2"
                            disabled={!filter.operator}
                          />
                        )}
                      </div>

                      <button
                        onClick={() => removeFilter(filter.id)}
                        className="text-red-600 hover:text-red-700 pt-2"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Preview */}
          {filters.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-blue-900">Segment Preview</h4>
              <p className="text-sm text-blue-800">
                Users who match ALL of the following conditions:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-700">
                {filters.map((filter, index) => {
                  const field = filterFields.find(f => f.value === filter.field)
                  const operator = field ? operators[field.type as keyof typeof operators].find(o => o.value === filter.operator) : null
                  
                  return (
                    <li key={filter.id}>
                      {index + 1}. {field?.label || 'Field'} {operator?.label.toLowerCase() || 'operator'} {filter.value || 'value'}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Link
              href="/admin/campaigns/segments"
              className="flex-1 text-center py-3 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
            >
              Cancel
            </Link>
            <button
              onClick={createSegment}
              disabled={loading || !name.trim() || filters.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Creating...' : 'Create Segment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}