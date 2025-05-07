'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Define Property interface
interface Property {
  id: string
  title: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  description: string
  imageUrl: string
  matchScore: number
  available: string
  source?: string
  externalUrl?: string
}

function SearchResults() {
  const searchParams = useSearchParams()

  // Get all search parameters
  const location = searchParams.get('location')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const bedrooms = searchParams.get('bedrooms')
  const bathrooms = searchParams.get('bathrooms')
  const positivePreferences = searchParams.get('positivePreferences')
  const negativePreferences = searchParams.get('negativePreferences')

  // Properly typed state
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true)

        // Build query string from all parameters
        const queryParams = new URLSearchParams()
        if (location) queryParams.append('location', location)
        if (minPrice) queryParams.append('minPrice', minPrice)
        if (maxPrice) queryParams.append('maxPrice', maxPrice)
        if (bedrooms) queryParams.append('bedrooms', bedrooms)
        if (bathrooms) queryParams.append('bathrooms', bathrooms)
        if (positivePreferences)
          queryParams.append('positivePreferences', positivePreferences)
        if (negativePreferences)
          queryParams.append('negativePreferences', negativePreferences)

        // Call our API endpoint
        const response = await fetch(
          `/api/properties?${queryParams.toString()}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch properties')
        }

        const data = await response.json()
        setProperties(data.properties)
        setError(null)
      } catch (err) {
        console.error('Error fetching properties:', err)
        setError('Something went wrong. Please try again.')
        setProperties([])
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [
    location,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    positivePreferences,
    negativePreferences,
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <main className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            {properties.length} Homes Found {location ? `in ${location}` : ''}
          </h1>

          <Link
            href="/search"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Modify Search
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600 dark:text-gray-300">
              Loading results...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              >
                <div className="relative h-48">
                  {/* In a real app, use Next.js Image component for better performance */}
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 right-0 bg-blue-600 text-white py-1 px-3 rounded-bl-lg font-medium">
                    ${property.price}/week
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold mb-2 flex-1">
                      {property.title}
                    </h2>
                    <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full px-2 py-1 text-sm font-medium whitespace-nowrap">
                      {property.matchScore}% Match
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {property.location}
                  </p>

                  <div className="flex gap-4 mb-3 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      {property.bedrooms}{' '}
                      {property.bedrooms === 1 ? 'Bed' : 'Beds'}
                    </div>
                    <div>
                      {property.bathrooms}{' '}
                      {property.bathrooms === 1 ? 'Bath' : 'Baths'}
                    </div>
                    <div>Available: {property.available}</div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {property.description}
                  </p>

                  <div className="flex justify-between items-center mt-4">
                    {property.source && (
                      <span className="text-xs text-gray-500">
                        Source: {property.source}
                      </span>
                    )}

                    {property.externalUrl ? (
                      <a
                        href={property.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View on {property.source || 'External Site'}
                      </a>
                    ) : (
                      <Link href={`/property/${property.id}`}>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
                          View Details
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && properties.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No properties found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Try adjusting your search criteria
            </p>
            <Link
              href="/search"
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 transition-all"
            >
              Back to Search
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

// Create a wrapper component that uses Suspense
export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-8">
          <main className="max-w-6xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-xl text-gray-600 dark:text-gray-300">
                Loading results...
              </div>
            </div>
          </main>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  )
}
