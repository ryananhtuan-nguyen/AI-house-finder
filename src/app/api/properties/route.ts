import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Mock database - in a real app this would come from a database
const PROPERTIES = [
  {
    id: 'prop1',
    title: 'Sunny 2 Bedroom in Wellington CBD',
    location: 'Wellington',
    price: 550,
    bedrooms: 2,
    bathrooms: 1,
    description:
      'Modern apartment with great natural light and renovated kitchen. Close to public transport and shops.',
    imageUrl:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    matchScore: 95,
    available: 'Now',
    amenities: ['Dishwasher', 'Heat Pump', 'Parking'],
    address: '123 Lambton Quay, Wellington',
    contactName: 'Jane Smith',
    contactPhone: '04-123-4567',
  },
  {
    id: 'prop2',
    title: 'Spacious Family Home in Lower Hutt',
    location: 'Lower Hutt',
    price: 650,
    bedrooms: 3,
    bathrooms: 2,
    description:
      'Quiet neighborhood, close to schools. Large backyard and modern appliances. Recently renovated bathroom.',
    imageUrl:
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG91c2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    matchScore: 88,
    available: '2023-06-01',
    amenities: ['Garden', 'Garage', 'Heat Pump', 'Pets Allowed'],
    address: '45 High Street, Lower Hutt',
    contactName: 'Michael Brown',
    contactPhone: '04-987-6543',
  },
  {
    id: 'prop3',
    title: 'Modern Studio in Auckland',
    location: 'Auckland',
    price: 420,
    bedrooms: 1,
    bathrooms: 1,
    description:
      'Compact but well-designed studio apartment. Great location with cafes and bus stops nearby.',
    imageUrl:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHN0dWRpbyUyMGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    matchScore: 82,
    available: 'Now',
    amenities: ['Furnished', 'Internet Included', 'Laundry Facilities'],
    address: '78 Queen Street, Auckland',
    contactName: 'Sarah Johnson',
    contactPhone: '09-555-1234',
  },
  {
    id: 'prop4',
    title: 'Charming Cottage in Christchurch',
    location: 'Christchurch',
    price: 480,
    bedrooms: 2,
    bathrooms: 1,
    description:
      'Beautifully renovated cottage with garden. Quiet street with friendly neighbors. Modern kitchen and cozy living room.',
    imageUrl:
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y290dGFnZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    matchScore: 91,
    available: '2023-06-15',
    amenities: ['Garden', 'Fireplace', 'Storage Shed'],
    address: '15 Riverside Lane, Christchurch',
    contactName: 'David Wilson',
    contactPhone: '03-333-7890',
  },
  {
    id: 'prop5',
    title: 'Waterfront Apartment in Tauranga',
    location: 'Tauranga',
    price: 595,
    bedrooms: 2,
    bathrooms: 2,
    description:
      'Modern apartment with stunning ocean views. Walking distance to cafes and shops. Includes parking and storage.',
    imageUrl:
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50JTIwdmlld3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    matchScore: 89,
    available: 'Now',
    amenities: ['Balcony', 'Sea View', 'Secure Parking', 'Gym'],
    address: '230 Marine Parade, Tauranga',
    contactName: 'Emma Taylor',
    contactPhone: '07-777-4321',
  },
]

export async function GET(request: NextRequest) {
  // Get search parameters
  const searchParams = request.nextUrl.searchParams
  const location = searchParams.get('location') || ''
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const bedrooms = searchParams.get('bedrooms')
  const bathrooms = searchParams.get('bathrooms')
  const positivePrefs = searchParams.get('positivePreferences')
  const negativePrefs = searchParams.get('negativePreferences')

  // Filter properties based on search criteria
  let filteredProperties = [...PROPERTIES]

  // Filter by location
  if (location) {
    filteredProperties = filteredProperties.filter((prop) =>
      prop.location.toLowerCase().includes(location.toLowerCase())
    )
  }

  // Filter by min price
  if (minPrice && !isNaN(Number(minPrice))) {
    filteredProperties = filteredProperties.filter(
      (prop) => prop.price >= Number(minPrice)
    )
  }

  // Filter by max price
  if (maxPrice && !isNaN(Number(maxPrice))) {
    filteredProperties = filteredProperties.filter(
      (prop) => prop.price <= Number(maxPrice)
    )
  }

  // Filter by minimum bedrooms
  if (bedrooms && !isNaN(Number(bedrooms))) {
    filteredProperties = filteredProperties.filter(
      (prop) => prop.bedrooms >= Number(bedrooms)
    )
  }

  // Filter by minimum bathrooms
  if (bathrooms && !isNaN(Number(bathrooms))) {
    filteredProperties = filteredProperties.filter(
      (prop) => prop.bathrooms >= Number(bathrooms)
    )
  }

  try {
    // Call our TradeMe scraper API to get external properties
    const scrapeUrl = new URL('/api/scrape/trademe', request.nextUrl.origin)

    // Add search params to the scraper request
    if (location) scrapeUrl.searchParams.append('location', location)
    if (minPrice) scrapeUrl.searchParams.append('minPrice', minPrice)
    if (maxPrice) scrapeUrl.searchParams.append('maxPrice', maxPrice)
    if (bedrooms) scrapeUrl.searchParams.append('bedrooms', bedrooms)
    if (bathrooms) scrapeUrl.searchParams.append('bathrooms', bathrooms)

    // Fetch external properties
    const externalPropsResponse = await fetch(scrapeUrl.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (externalPropsResponse.ok) {
      const externalProps = await externalPropsResponse.json()

      // Combine our mock properties with the scraped properties
      filteredProperties = [...filteredProperties, ...externalProps.properties]
    }
  } catch (error) {
    console.error('Error fetching external properties:', error)
  }

  // Simple AI filtering based on positive and negative preferences
  if (positivePrefs) {
    // Split preferences into keywords
    const keywords = positivePrefs
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(Boolean)

    filteredProperties = filteredProperties.map((prop) => {
      // Count keyword matches in description
      const matchCount = keywords.filter((keyword) =>
        prop.description.toLowerCase().includes(keyword)
      ).length

      // Adjust match score based on matches (simple algorithm)
      const adjustedScore = Math.min(prop.matchScore + matchCount * 3, 100)
      return {
        ...prop,
        matchScore: adjustedScore,
      }
    })
  }

  if (negativePrefs) {
    // Split negative preferences into keywords
    const keywords = negativePrefs
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(Boolean)

    // Reduce match score for properties with negative keywords
    filteredProperties = filteredProperties.map((prop) => {
      const matchCount = keywords.filter((keyword) =>
        prop.description.toLowerCase().includes(keyword)
      ).length

      if (matchCount > 0) {
        // Significantly reduce match score for each negative keyword
        const adjustedScore = Math.max(prop.matchScore - matchCount * 15, 0)
        return {
          ...prop,
          matchScore: adjustedScore,
        }
      }

      return prop
    })
  }

  // Sort by match score
  filteredProperties.sort((a, b) => b.matchScore - a.matchScore)

  // Add artificial delay to simulate real API
  await new Promise((resolve) => setTimeout(resolve, 800))

  return NextResponse.json({
    properties: filteredProperties,
    count: filteredProperties.length,
    sources: ['OneRoof', 'HomeNZ'], // List of sources that were successfully fetched
    missingSources: [], // Sources that need authentication
    authUrls: {},
  })
}
