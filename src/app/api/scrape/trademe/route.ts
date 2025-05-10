import { NextResponse } from 'next/server'
import OAuth from 'oauth-1.0a'
import crypto from 'crypto'
import { cookies } from 'next/headers'

// Define better types
interface TradePropertyListing {
  ListingId?: string | number
  Title?: string
  Suburb?: string
  City?: string
  PriceDisplay?: string | number
  Bedrooms?: number
  Bathrooms?: number
  Body?: string
  PictureHref?: string
  AvailableFrom?: string
  [key: string]: any
}

// Helper function to map location names to TradeMe region IDs
function mapLocationToTradeMe(location: string): string {
  // Location mapping based on TradeMe's region IDs
  const locationMap: Record<string, string> = {
    auckland: '1', // Auckland region
    wellington: '15', // Wellington region
    christchurch: '14', // Canterbury region
    hamilton: '2', // Waikato region
    tauranga: '2', // Bay of Plenty region
    dunedin: '12', // Otago region
    'palmerston north': '8', // Manawatu/Wanganui
    nelson: '16', // Nelson/Marlborough
    rotorua: '2', // Bay of Plenty
    'new plymouth': '10', // Taranaki
    napier: '6', // Hawke's Bay
    invercargill: '17', // Southland
    whangarei: '3', // Northland
    // Add more as needed
  }

  return locationMap[location.toLowerCase()] || '0' // Default to all of NZ (0)
}

// Helper function to extract price from price display string
function extractPrice(priceStr: string | number): number {
  if (typeof priceStr === 'number') return priceStr
  if (!priceStr) return 0

  // Extract numeric value from price string (e.g., "$450 per week" → 450)
  const priceMatch = priceStr.toString().match(/\$?([\d,]+)/)
  if (priceMatch) {
    return parseInt(priceMatch[1].replace(/,/g, ''))
  }
  return 0
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Get search parameters
  const location = searchParams.get('location') || 'auckland'
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const bedrooms = searchParams.get('bedrooms')
  const bathrooms = searchParams.get('bathrooms')

  try {
    // Get the stored access tokens - FIX: await cookies()
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('trademe_access_token')?.value
    const accessTokenSecret = cookieStore.get(
      'trademe_access_token_secret'
    )?.value

    // If we don't have tokens, redirect to the auth flow
    if (!accessToken || !accessTokenSecret) {
      // Create a redirect to the auth endpoint
      const authUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/trademe`
      return NextResponse.json(
        {
          error: 'Authentication required',
          authUrl,
        },
        { status: 401 }
      )
    }

    // Rest of your code remains the same...
    // Set up OAuth with the stored tokens
    const oauth = new OAuth({
      consumer: {
        key: process.env.TRADEME_API_KEY!,
        secret: process.env.TRADEME_SECRET_KEY!,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64')
      },
    })

    // Build API URL with parameters
    const apiUrl = new URL(
      'https://api.tmsandbox.co.nz/v1/Search/Property/Rental.json'
    )

    // Add search parameters
    if (location) {
      const locationId = mapLocationToTradeMe(location)
      apiUrl.searchParams.append('region', locationId)
    }
    if (minPrice) apiUrl.searchParams.append('price_min', minPrice)
    if (maxPrice) apiUrl.searchParams.append('price_max', maxPrice)
    if (bedrooms) apiUrl.searchParams.append('bedrooms_min', bedrooms)
    if (bathrooms) apiUrl.searchParams.append('bathrooms_min', bathrooms)

    // Prepare OAuth request
    const requestData = {
      url: apiUrl.toString(),
      method: 'GET',
    }

    // Generate headers using our access tokens - Use PLAINTEXT method
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const nonce = crypto.randomBytes(16).toString('hex')
    const consumerKey = process.env.TRADEME_API_KEY!
    const consumerSecret = process.env.TRADEME_SECRET_KEY!

    // For PLAINTEXT method, the signature is consumer_secret&token_secret
    const signature = `${encodeURIComponent(
      consumerSecret
    )}&${encodeURIComponent(accessTokenSecret)}`

    // Create Authorization header
    const authHeader =
      `OAuth oauth_consumer_key="${encodeURIComponent(consumerKey)}", ` +
      `oauth_nonce="${encodeURIComponent(nonce)}", ` +
      `oauth_signature="${signature}", ` +
      `oauth_signature_method="PLAINTEXT", ` +
      `oauth_timestamp="${timestamp}", ` +
      `oauth_token="${encodeURIComponent(accessToken)}", ` +
      `oauth_version="1.0"`

    console.log('Making TradeMe API request with OAuth tokens')

    // Make the request with proper OAuth headers
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(
        `TradeMe API error: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log('Received response from TradeMe API')

    // Process the property data
    const properties =
      data.List?.map((item: TradePropertyListing, index: number) => ({
        id: `trademe-${item.ListingId || index}`,
        title: item.Title || 'No Title',
        location:
          `${item.Suburb || ''}, ${item.City || ''}`.trim() ||
          'Unknown Location',
        price: extractPrice(item.PriceDisplay || ''),
        bedrooms: item.Bedrooms || 0,
        bathrooms: item.Bathrooms || 0,
        description: item.Body || item.Title || 'No Description',
        imageUrl:
          item.PictureHref ||
          'https://via.placeholder.com/300x200?text=No+Image',
        matchScore: 85, // Default match score
        available: item.AvailableFrom || 'Now',
        externalUrl: `https://www.tmsandbox.co.nz/a/property/residential/rent/listing/${item.ListingId}`,
        source: 'TradeMe',
      })) || []

    return NextResponse.json({
      properties: properties || [],
      count: properties?.length || 0,
      source: 'TradeMe API',
      query: {
        location,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
      },
    })
  } catch (error: unknown) {
    console.error('Error with TradeMe API:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch from TradeMe API',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
