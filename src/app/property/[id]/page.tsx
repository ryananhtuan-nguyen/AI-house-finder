'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// Define the Property interface with additional details
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
  amenities?: string[]
  address?: string
  contactName?: string
  contactPhone?: string
}

export default function PropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProperty() {
      if (!params.id) return

      try {
        setLoading(true)
        // In a real app, you'd fetch from a real API
        const response = await fetch(`/api/properties/${params.id}`)

        if (!response.ok) {
          throw new Error('Failed to fetch property details')
        }

        const data = await response.json()
        setProperty(data.property)
      } catch (err) {
        console.error('Error fetching property:', err)
        setError('Could not load property details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-8">
        <main className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600 dark:text-gray-300">
              Loading property details...
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-8">
        <main className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error || 'Property not found'}
          </div>
          <Link
            href="/search/results"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            &larr; Back to search results
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/search/results"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <span>&larr;</span> Back to search results
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="relative h-64 md:h-96">
            <img
              src={property.imageUrl}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-0 right-0 bg-blue-600 text-white py-2 px-4 rounded-bl-lg font-medium">
              ${property.price}/week
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold flex-1">
                {property.title}
              </h1>
              <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap">
                {property.matchScore}% Match
              </div>
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {property.address || property.location}
            </p>

            <div className="flex flex-wrap gap-6 mb-8 text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>
                  {property.bedrooms}{' '}
                  {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                  />
                </svg>
                <span>
                  {property.bathrooms}{' '}
                  {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v.5"
                  />
                </svg>
                <span>Available: {property.available}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-300">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-semibold mb-4">
                Contact Information
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="font-medium mb-2">
                  {property.contactName || 'Property Manager'}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {property.contactPhone || 'Contact information unavailable'}
                </p>
                <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors w-full sm:w-auto">
                  Request Viewing
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
