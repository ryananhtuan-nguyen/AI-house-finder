import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  console.log('Starting TradeMe OAuth flow')

  // Step 1: Create OAuth timestamp and nonce
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = crypto.randomBytes(16).toString('hex')

  // Consumer credentials
  const consumerKey = process.env.TRADEME_API_KEY ?? ''
  const consumerSecret = process.env.TRADEME_SECRET_KEY ?? ''

  console.log('Using consumer key:', consumerKey.substring(0, 5) + '...')

  // Request token URL and callback
  const requestTokenURL = 'https://secure.tmsandbox.co.nz/Oauth/RequestToken'
  const callbackUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  }/api/auth/trademe/callback`

  console.log('Callback URL:', callbackUrl)

  try {
    // Create parameter string in the exact format TradeMe expects
    const parameterString =
      `oauth_callback=${encodeURIComponent(callbackUrl)}&` +
      `oauth_consumer_key=${encodeURIComponent(consumerKey)}&` +
      `oauth_nonce=${encodeURIComponent(nonce)}&` +
      `oauth_signature_method=PLAINTEXT&` +
      `oauth_timestamp=${encodeURIComponent(timestamp)}&` +
      `oauth_version=1.0`

    // For PLAINTEXT method, the signature is just the consumer secret and "&"
    // No token secret yet since we're getting the initial token
    const signature = `${encodeURIComponent(consumerSecret)}&`

    // Create Authorization header value
    const authHeader =
      `OAuth oauth_callback="${encodeURIComponent(callbackUrl)}", ` +
      `oauth_consumer_key="${encodeURIComponent(consumerKey)}", ` +
      `oauth_nonce="${encodeURIComponent(nonce)}", ` +
      `oauth_signature="${signature}", ` +
      `oauth_signature_method="PLAINTEXT", ` +
      `oauth_timestamp="${timestamp}", ` +
      `oauth_version="1.0"`

    console.log('Authorization header:', authHeader)

    // Make the request to TradeMe
    const response = await fetch(requestTokenURL, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    console.log('TradeMe token request status:', response.status)
    console.log('TradeMe token request statusText:', response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Response body:', errorText)
      throw new Error(
        `Request token error: ${response.status} ${response.statusText}`
      )
    }

    const responseText = await response.text()
    console.log('TradeMe token response:', responseText)

    const parsedResponse = new URLSearchParams(responseText)
    const oauthToken = parsedResponse.get('oauth_token')
    const oauthTokenSecret = parsedResponse.get('oauth_token_secret')

    if (!oauthToken || !oauthTokenSecret) {
      throw new Error('Invalid response from request token endpoint')
    }

    console.log('Received oauth_token:', oauthToken.substring(0, 5) + '...')

    // Store token secret in a cookie (needed for the callback)
    const cookieStore = await cookies()
    cookieStore.set('trademe_oauth_token_secret', oauthTokenSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    })

    // Redirect user to TradeMe authorization page
    const authUrl = `https://secure.tmsandbox.co.nz/Oauth/Authorize?oauth_token=${oauthToken}`
    console.log('Redirecting to TradeMe auth URL:', authUrl)

    return NextResponse.redirect(authUrl)
  } catch (error: unknown) {
    console.error('TradeMe OAuth error:', error)
    return NextResponse.json(
      {
        error: 'Failed to initialize TradeMe OAuth flow',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
