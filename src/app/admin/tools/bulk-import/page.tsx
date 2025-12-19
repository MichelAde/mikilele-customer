'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, Download, FileSpreadsheet } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

export default function BulkImportPage() {
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleEventsImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      const rows = text.split('\n').slice(1) // Skip header
      const events = []

      for (const row of rows) {
        const [title, description, startDate, endDate, venueName, city, province] = row.split(',')
        
        if (!title || !startDate) continue

        events.push({
          title: title.trim(),
          slug: title.toLowerCase().replace(/\s+/g, '-'),
          description: description?.trim(),
          start_datetime: new Date(startDate.trim()).toISOString(),
          end_datetime: endDate ? new Date(endDate.trim()).toISOString() : new Date(startDate.trim()).toISOString(),
          venue_name: venueName?.trim(),
          city: city?.trim(),
          province: province?.trim(),
          status: 'published',
          visibility: 'public'
        })
      }

      const { data, error } = await supabase
        .from('events')
        .insert(events)
        .select()

      if (error) throw error

      setResults({
        success: true,
        count: data.length,
        message: `Successfully imported ${data.length} events`
      })
    } catch (error: any) {
      setResults({
        success: false,
        message: error.message
      })
    } finally {
      setImporting(false)
    }
  }

  async function handleCoursesImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      const rows = text.split('\n').slice(1)
      const courses = []

      for (const row of rows) {
        const [title, description, level, durationWeeks, maxStudents, price, instructor, schedule] = row.split(',')
        
        if (!title) continue

        courses.push({
          title: title.trim(),
          description: description?.trim(),
          level: level?.trim() || 'beginner',
          duration_weeks: parseInt(durationWeeks) || 8,
          max_students: parseInt(maxStudents) || 20,
          price: parseFloat(price) || 0,
          instructor: instructor?.trim(),
          schedule: schedule?.trim(),
          is_active: true,
          slug: title.toLowerCase().replace(/\s+/g, '-')
        })
      }

      const { data, error } = await supabase
        .from('courses')
        .insert(courses)
        .select()

      if (error) throw error

      setResults({
        success: true,
        count: data.length,
        message: `Successfully imported ${data.length} courses`
      })
    } catch (error: any) {
      setResults({
        success: false,
        message: error.message
      })
    } finally {
      setImporting(false)
    }
  }

  async function handlePassesImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      const rows = text.split('\n').slice(1)
      const passes = []

      for (const row of rows) {
        const [name, type, price, credits, validityDays, description] = row.split(',')
        
        if (!name || !type) continue

        passes.push({
          name: name.trim(),
          type: type.trim(),
          price: parseFloat(price) || 0,
          credits: parseInt(credits) || 1,
          validity_days: validityDays ? parseInt(validityDays) : null,
          description: description?.trim(),
          is_active: true
        })
      }

      const { data, error } = await supabase
        .from('pass_types')
        .insert(passes)
        .select()

      if (error) throw error

      setResults({
        success: true,
        count: data.length,
        message: `Successfully imported ${data.length} passes`
      })
    } catch (error: any) {
      setResults({
        success: false,
        message: error.message
      })
    } finally {
      setImporting(false)
    }
  }

  function downloadEventsTemplate() {
    const csv = `title,description,start_date,end_date,venue_name,city,province
Semba Night,Amazing Semba dancing,2025-01-15 20:00,2025-01-15 23:00,Ottawa Dance Studio,Ottawa,ON
Kizomba Social,Monthly Kizomba event,2025-01-20 19:00,2025-01-20 23:00,Toronto Dance Hall,Toronto,ON
Afrobeats Party,Dance party with DJ,2025-02-01 21:00,2025-02-02 02:00,Montreal Club,Montreal,QC`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'events_template.csv'
    a.click()
  }

  function downloadCoursesTemplate() {
    const csv = `title,description,level,duration_weeks,max_students,price,instructor,schedule
Beginner Semba,Learn the fundamentals,beginner,8,20,179,Mikilele,Thursdays 7-9 PM
Intermediate Kizomba,Advanced techniques,intermediate,10,15,249,Ana Silva,Tuesdays 8-10 PM
Advanced Afrobeats,Master level dancing,advanced,12,12,299,DJ Kwame,Saturdays 6-8 PM`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'courses_template.csv'
    a.click()
  }

  function downloadPassesTemplate() {
    const csv = `name,type,price,credits,validity_days,description
Monthly Pass,monthly,99,4,30,4 events per month
All Access,all_access,299,999,365,Unlimited events for 1 year
5-Pack,custom,149,5,90,5 events within 90 days
Single Event,single_event,35,1,,One-time event access`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'passes_template.csv'
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          {/* Bulk Import - NEW! */}
          <Link
            href="/admin/tools/bulk-import"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 hover:border-purple-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-gray-500 to-gray-700 p-4 rounded-lg">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Bulk Import</h2>
                <p className="text-gray-600 text-sm">Import multiple items</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bulk Import</h1>
          <p className="text-gray-600">Import multiple events, courses, and passes at once</p>
        </div>

        {results && (
          <div className={`mb-6 p-4 rounded-lg ${
            results.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={results.success ? 'text-green-800' : 'text-red-800'}>
              {results.message}
            </p>
          </div>
        )}

        {/* Events Import */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Import Events</h2>
          </div>
          
          <div className="mb-4">
            <button
              onClick={downloadEventsTemplate}
              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
            >
              <Download className="w-4 h-4" />
              Download CSV Template
            </button>
          </div>

          <div>
            <label className="block">
              <span className="sr-only">Choose CSV file</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleEventsImport}
                disabled={importing}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-50 file:text-purple-700
                  hover:file:bg-purple-100"
              />
            </label>
          </div>
        </div>

        {/* Courses Import */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Import Courses</h2>
          </div>
          
          <div className="mb-4">
            <button
              onClick={downloadCoursesTemplate}
              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
            >
              <Download className="w-4 h-4" />
              Download CSV Template
            </button>
          </div>

          <div>
            <label className="block">
              <span className="sr-only">Choose CSV file</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleCoursesImport}
                disabled={importing}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-50 file:text-green-700
                  hover:file:bg-green-100"
              />
            </label>
          </div>
        </div>

        {/* Passes Import */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Import Passes</h2>
          </div>
          
          <div className="mb-4">
            <button
              onClick={downloadPassesTemplate}
              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
            >
              <Download className="w-4 h-4" />
              Download CSV Template
            </button>
          </div>

          <div>
            <label className="block">
              <span className="sr-only">Choose CSV file</span>
              <input
                type="file"
                accept=".csv"
                onChange={handlePassesImport}
                disabled={importing}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-50 file:text-purple-700
                  hover:file:bg-purple-100"
              />
            </label>
          </div>
        </div>

        {importing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-700">Importing data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}