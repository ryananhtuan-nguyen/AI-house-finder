'use client'

import { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Define form data interface
interface SearchFormData {
  location: string
  minPrice: string
  maxPrice: string
  bedrooms: string
  bathrooms: string
  positivePreferences: string
  negativePreferences: string
}

// Define recent search interface
interface RecentSearch {
  id: string
  location: string
  timestamp: number
  queryString: string
}

export default function SearchPage() {
  // State to store form values with proper typing
  const [formData, setFormData] = useState<SearchFormData>({
    location: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    positivePreferences: '',
    negativePreferences: '',
  })

  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem('recentSearches')
      if (savedSearches) {
        const parsed = JSON.parse(savedSearches)
        setRecentSearches(parsed)
      }
    } catch (error) {
      console.error('Error loading recent searches:', error)
    }
  }, [])

  // Handle form input changes with proper event typing
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Save search to recent searches
  const saveSearch = (queryString: string) => {
    try {
      // Create new search object
      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        location: formData.location,
        timestamp: Date.now(),
        queryString,
      }

      // Add to recent searches (maximum 5)
      const updatedSearches = [newSearch, ...recentSearches].slice(0, 5)

      // Save to state and localStorage
      setRecentSearches(updatedSearches)
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches))
    } catch (error) {
      console.error('Error saving recent search:', error)
    }
  }

  // Handle form submission with proper event typing
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Build query string with all form fields
    const queryParams = new URLSearchParams()
    if (formData.location) queryParams.append('location', formData.location)
    if (formData.minPrice) queryParams.append('minPrice', formData.minPrice)
    if (formData.maxPrice) queryParams.append('maxPrice', formData.maxPrice)
    if (formData.bedrooms) queryParams.append('bedrooms', formData.bedrooms)
    if (formData.bathrooms) queryParams.append('bathrooms', formData.bathrooms)
    if (formData.positivePreferences)
      queryParams.append('positivePreferences', formData.positivePreferences)
    if (formData.negativePreferences)
      queryParams.append('negativePreferences', formData.negativePreferences)

    // Save search to recent searches
    saveSearch(queryParams.toString())

    // Simulate search delay
    setTimeout(() => {
      // Navigate to results page with all parameters
      router.push(`/search/results?${queryParams.toString()}`)
      setIsSubmitting(false)
    }, 800)
  }

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Find Your Perfect NZ Home
        </h1>

        {/* Recent searches section */}
        {recentSearches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-3">Recent Searches</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentSearches.map((search) => (
                <Link
                  key={search.id}
                  href={`/search/results?${search.queryString}`}
                  className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {search.location || 'All Locations'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(search.timestamp)}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, suburb or region"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Price (NZD)
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={formData.minPrice}
                  onChange={handleChange}
                  placeholder="Min $"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Price (NZD)
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={formData.maxPrice}
                  onChange={handleChange}
                  placeholder="Max $"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bedrooms
                </label>
                <select
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bathrooms
                </label>
                <select
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>
            </div>

            {/* AI Preferences */}
            <div className="border-t pt-6 mt-6 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-4">
                AI-Powered Preferences
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    What do you want in a home? (Natural language)
                  </label>
                  <textarea
                    name="positivePreferences"
                    value={formData.positivePreferences}
                    onChange={handleChange}
                    placeholder="e.g., close to schools, sunny living areas, modern kitchen, quiet neighborhood"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white h-24 resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    What are your deal-breakers? (Natural language)
                  </label>
                  <textarea
                    name="negativePreferences"
                    value={formData.negativePreferences}
                    onChange={handleChange}
                    placeholder="e.g., no busy roads, not basement level, no old appliances, not near industrial areas"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white h-24 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 text-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Searching...' : 'Find Matches'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
