import { NextResponse } from 'next/server'
import { chromium } from 'playwright'
import fs from 'fs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Get search parameters from request
  const location = searchParams.get('location') || 'auckland'
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const bedrooms = searchParams.get('bedrooms')
  const bathrooms = searchParams.get('bathrooms')

  let browser

  try {
    // Build TradeMe URL based on search parameters
    let url = `https://www.trademe.co.nz/a/property/residential/rent/${location}/search?`

    const queryParams = new URLSearchParams()
    if (minPrice) queryParams.append('price_min', minPrice)
    if (maxPrice) queryParams.append('price_max', maxPrice)
    if (bedrooms) queryParams.append('bedrooms_min', bedrooms)
    if (bathrooms) queryParams.append('bathrooms_min', bathrooms)

    // Add common filters
    queryParams.append('property_type', 'apartment')
    queryParams.append('property_type', 'house')
    queryParams.append('property_type', 'townhouse')

    url += queryParams.toString()

    console.log(`Scraping URL: ${url}`)

    // Launch browser with playwright
    browser = await chromium.launch({
      headless: true,
    })

    // Create context WITH JavaScript enabled
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      javaScriptEnabled: true, // JavaScript must be enabled for TradeMe
    })

    const page = await context.newPage()

    // Store API responses
    const apiResponses: any[] = []

    // IMPROVED: Use a more specific route pattern to catch property data APIs
    await page.route('**/*', async (route) => {
      const url = route.request().url()
      const method = route.request().method()

      // Target the search result endpoints specifically
      if (
        url.includes('/api/v1/search/property/rental') ||
        url.includes('rsqid') ||
        url.includes('search-results')
      ) {
        console.log('Intercepted potential property API call:', url)

        try {
          const response = await route.fetch()
          const contentType = response.headers()['content-type'] || ''

          // Only process JSON responses
          if (contentType.includes('application/json')) {
            const jsonData = await response.json()
            console.log('Found property data API response')
            apiResponses.push({
              url,
              status: response.status(),
              body: jsonData,
            })
          }

          await route.fulfill({ response })
        } catch (error) {
          console.error('Error intercepting API call:', error)
          await route.continue()
        }
      } else {
        await route.continue()
      }
    })

    // First use a more reliable waitUntil option
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000, // 60-second timeout
    })

    console.log('Page loaded, waiting for content to render...')

    // Try different wait strategies to ensure page content loads
    try {
      // Wait for a reasonable amount of time for SPA content to render
      await page.waitForTimeout(50000)

      // Wait for search results to appear
      await Promise.race([
        page.waitForSelector('.tm-property-search-card', { timeout: 100000 }),
        page.waitForSelector('tm-search-card', { timeout: 100000 }),
        page.waitForSelector('.o-card', { timeout: 100000 }),
      ])

      console.log('Search results found on page')
    } catch (error) {
      console.warn(
        'Timed out waiting for search results to appear, continuing anyway'
      )
    }

    // Take screenshot for debugging
    await page.screenshot({ path: 'trademe-page.png' })

    // Save HTML for debugging
    const content = await page.content()
    fs.writeFileSync('trademe-debug.html', content)

    // Define our property array
    let properties: any[] = []

    // IMPROVED: Check if we've captured API responses with property data
    if (apiResponses.length > 0) {
      console.log(`Found ${apiResponses.length} API responses, processing...`)

      // Try to find the most likely API response with listing data
      const propertyResponse = apiResponses.find((resp) => {
        // Check for common data structures in the TradeMe API responses
        return (
          resp.body &&
          (resp.body.List ||
            resp.body.list ||
            resp.body.props ||
            resp.body.properties ||
            resp.body.results ||
            (resp.body.data && resp.body.data.list))
        )
      })

      if (propertyResponse) {
        console.log('Found property listing data in API response')

        // Extract the actual listing array, handling different response structures
        const listings =
          propertyResponse.body.List ||
          propertyResponse.body.list ||
          propertyResponse.body.props ||
          propertyResponse.body.properties ||
          propertyResponse.body.results ||
          (propertyResponse.body.data && propertyResponse.body.data.list) ||
          []

        properties = (listings as any[]).map((item, index) => {
          // Handle various property data structures and field names
          return {
            id: `trademe-${index}`,
            title: item.Title || item.title || item.name || 'No Title',
            location:
              item.Suburb ||
              item.suburb ||
              item.Location ||
              item.location ||
              item.address ||
              'Unknown Location',
            price: item.PriceDisplay || item.price || item.Price || 0,
            bedrooms: item.Bedrooms || item.bedrooms || 0,
            bathrooms: item.Bathrooms || item.bathrooms || 0,
            description:
              item.Description ||
              item.description ||
              `${item.Title || item.title || 'Property'} in ${
                item.Location || item.location || 'Unknown Location'
              }`,
            imageUrl:
              item.PictureHref ||
              item.pictureHref ||
              item.ImageUrl ||
              item.imageUrl ||
              'https://via.placeholder.com/300x200?text=No+Image',
            matchScore: 85, // Default match score
            available: item.AvailableFrom || item.availableFrom || 'Now',
            externalUrl:
              item.ListingUrl ||
              item.listingUrl ||
              `https://www.trademe.co.nz/a/property/residential/rent/${location}/${
                item.ListingId || item.listingId || ''
              }`,
            source: 'TradeMe',
          }
        })
      }
    }

    // If API responses didn't work, try DOM scraping as fallback
    if (properties.length === 0) {
      console.log(
        'No properties found in API responses, falling back to DOM scraping'
      )

      // IMPROVED: More specific selectors and robust extraction
      const cardSelectors = [
        '.tm-property-search-card',
        'tm-search-card',
        '.o-card',
        '.search-card',
        '[data-test="search-card"]',
        'article', // Generic fallback
      ]

      // Try each selector
      for (const selector of cardSelectors) {
        console.log(`Trying selector: ${selector}`)
        const count = await page.locator(selector).count()
        console.log(`Found ${count} items with selector ${selector}`)

        if (count > 0) {
          // We found property cards with this selector
          properties = await page.$$eval(selector, (cards) => {
            return cards.map((card) => {
              // IMPROVED: More specific inner element selectors with multiple fallbacks
              const titleSelectors = [
                '.tm-property-search-card__title',
                '.o-card__heading',
                '[data-test="listing-card-title"]',
                'h3',
                '.title',
              ]

              const priceSelectors = [
                '.tm-property-search-card__price',
                '.o-card__price',
                '[data-test="listing-card-price"]',
                '.price',
              ]

              const locationSelectors = [
                '.tm-property-search-card__subtitle',
                '.o-card__secondary-text',
                '[data-test="listing-card-subtitle"]',
                '.subtitle',
                '.location',
              ]

              // Helper function to try multiple selectors
              const getTextFromSelectors = (selectors: any) => {
                for (const sel of selectors) {
                  const el = card.querySelector(sel)
                  if (el && el.textContent) {
                    return el.textContent.trim()
                  }
                }
                return null
              }

              // Extract data using our helper and fallbacks
              const title = getTextFromSelectors(titleSelectors) || 'No Title'
              const price = getTextFromSelectors(priceSelectors) || '0'
              const location =
                getTextFromSelectors(locationSelectors) || 'Unknown Location'

              // Extract bedrooms and bathrooms
              let bedrooms = '0'
              let bathrooms = '0'

              // Try to find structured attribute data
              const cardText = card.textContent || ''
              const bedroomMatch = cardText.match(/(\d+)\s*bed/i)
              const bathroomMatch = cardText.match(/(\d+)\s*bath/i)

              if (bedroomMatch) bedrooms = bedroomMatch[1]
              if (bathroomMatch) bathrooms = bathroomMatch[1]

              // Extract image URL
              const imgEl = card.querySelector('img')
              const imageUrl = imgEl
                ? imgEl.getAttribute('src') || imgEl.getAttribute('data-src')
                : null

              // Extract listing URL
              let listingUrl = null
              const linkEl = card.closest('a') || card.querySelector('a')
              if (linkEl) {
                listingUrl = linkEl.getAttribute('href')
                if (listingUrl && !listingUrl.startsWith('http')) {
                  listingUrl = 'https://www.trademe.co.nz' + listingUrl
                }
              }

              return {
                title,
                price,
                location,
                bedrooms,
                bathrooms,
                imageUrl,
                listingUrl,
              }
            })
          })

          // Format the properties
          properties = properties.map((prop, index) => {
            // Parse price string to extract numeric value
            let priceValue = 0
            if (typeof prop.price === 'string') {
              const priceMatch = prop.price.match(/\$?([\d,]+)/)
              if (priceMatch) {
                priceValue = parseInt(priceMatch[1].replace(/,/g, ''))
              }
            } else if (typeof prop.price === 'number') {
              priceValue = prop.price
            }

            return {
              id: `trademe-${index}`,
              title: prop.title || 'No Title',
              location: prop.location || 'Unknown Location',
              price: priceValue,
              bedrooms:
                typeof prop.bedrooms === 'string'
                  ? parseInt(prop.bedrooms) || 0
                  : prop.bedrooms || 0,
              bathrooms:
                typeof prop.bathrooms === 'string'
                  ? parseInt(prop.bathrooms) || 0
                  : prop.bathrooms || 0,
              description: `${prop.title} - ${prop.location}`,
              imageUrl:
                prop.imageUrl ||
                'https://via.placeholder.com/300x200?text=No+Image',
              matchScore: 85,
              available: 'Now',
              externalUrl: prop.listingUrl,
              source: 'TradeMe',
            }
          })

          break
        }
      }
    }

    console.log(`Found ${properties.length} properties`)

    // Log sample property for debugging
    if (properties.length > 0) {
      console.log('Sample property:', JSON.stringify(properties[0], null, 2))
    }

    // Close the browser
    await browser.close()

    // Return the scraped data
    return NextResponse.json({
      properties,
      count: properties.length,
      source: 'TradeMe',
      query: {
        location,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
      },
    })
  } catch (error: any) {
    console.error('Error scraping TradeMe:', error)

    // Make sure we close the browser on error
    if (browser) {
      await browser.close()
    }

    return NextResponse.json(
      { error: 'Failed to scrape TradeMe', message: error.message },
      { status: 500 }
    )
  }
}
