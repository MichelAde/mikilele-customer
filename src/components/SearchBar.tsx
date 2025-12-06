'use client'

import { Search, X } from 'lucide-react'

interface SearchBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}: SearchBarProps) {
  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'dance_social', label: 'Dance Social' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'class', label: 'Class' },
    { value: 'concert', label: 'Concert' },
    { value: 'festival', label: 'Festival' },
  ]

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}