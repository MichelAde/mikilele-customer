'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Sparkles, BookOpen } from 'lucide-react'

export default function CreateCourse() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [generatingCurriculum, setGeneratingCurriculum] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'beginner',
    duration_weeks: '8',
    max_students: '20',
    price: '',
    schedule: '',
    instructor: '',
    goals: '',
    is_active: true
  })

  const [curriculum, setCurriculum] = useState<any>(null)

  async function generateCurriculum() {
    if (!formData.title) {
      alert('Please enter a course title first')
      return
    }

    setGeneratingCurriculum(true)

    try {
      const response = await fetch('/api/courses/generate-curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle: formData.title,
          level: formData.level,
          duration: `${formData.duration_weeks} weeks`,
          goals: formData.goals
        })
      })

      const data = await response.json()

      if (data.success) {
        setCurriculum(data.curriculum)
        // Update description if empty
        if (!formData.description && data.curriculum.overview) {
          setFormData({...formData, description: data.curriculum.overview})
        }
      } else {
        alert(data.error || 'Failed to generate curriculum')
      }
    } catch (error) {
      console.error('Error generating curriculum:', error)
      alert('Failed to generate curriculum')
    } finally {
      setGeneratingCurriculum(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.title || !formData.level) {
      alert('Please fill in required fields')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/courses/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          curriculum: curriculum ? JSON.stringify(curriculum) : null
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Course created successfully!')
        router.push('/admin/school/courses')
      } else {
        alert(data.error || 'Failed to create course')
      }
    } catch (error) {
      console.error('Error creating course:', error)
      alert('Failed to create course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/admin/school/courses"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Course</h1>
          <p className="text-gray-600">Set up a new dance course with AI-generated curriculum</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Beginner Kizomba Fundamentals"
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Level *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duration (Weeks)</label>
                  <input
                    type="number"
                    value={formData.duration_weeks}
                    onChange={(e) => setFormData({...formData, duration_weeks: e.target.value})}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Course Goals (for AI generation)
                </label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                  placeholder="e.g., Master basic steps, develop rhythm, understand connection..."
                  rows={2}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="button"
                onClick={generateCurriculum}
                disabled={generatingCurriculum || !formData.title}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                {generatingCurriculum ? 'Generating Curriculum...' : 'Generate Curriculum with AI'}
              </button>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Max Students</label>
                  <input
                    type="number"
                    value={formData.max_students}
                    onChange={(e) => setFormData({...formData, max_students: e.target.value})}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Schedule</label>
                  <input
                    type="text"
                    value={formData.schedule}
                    onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                    placeholder="e.g., Mondays 7-8pm"
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Instructor</label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                    placeholder="Instructor name"
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Active (course available for enrollment)
                </label>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <Link
                  href="/admin/school/courses"
                  className="flex-1 text-center py-3 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>

          {/* Curriculum Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">AI-Generated Curriculum</h3>
              </div>

              {!curriculum ? (
                <div className="text-center py-12 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Click "Generate Curriculum" to create a detailed lesson plan with AI</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Overview</h4>
                    <p className="text-sm text-gray-600">{curriculum.overview}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Objectives</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {curriculum.objectives?.map((obj: string, i: number) => (
                        <li key={i} className="flex gap-2">
                          <span>•</span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Weekly Plan</h4>
                    <div className="space-y-2">
                      {curriculum.weeks?.map((week: any) => (
                        <div key={week.week} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-semibold text-sm">Week {week.week}: {week.title}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {week.topics?.slice(0, 2).join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}