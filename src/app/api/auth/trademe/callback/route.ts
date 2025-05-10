import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  console.log('TradeMe OAuth callback received')

  const { searchParams } = new URL(request.url)
  const oauthToken = searchParams.get('oauth_token')
  const oauthVerifier = searchParams.get('oauth_verifier')

  console.log('Received token:', oauthToken?.substring(0, 5) + '...')
  console.log('Received verifier:', oauthVerifier?.substring(0, 5) + '...')

  // Retrieve the token secret from the cookie
  const cookieStore = await cookies()
  const tokenSecret = cookieStore.get('trademe_oauth_token_secret')?.value

  if (!oauthToken || !oauthVerifier || !tokenSecret) {
    console.error('Missing required OAuth parameters', {
      hasToken: !!oauthToken,
      hasVerifier: !!oauthVerifier,
      hasSecret: !!tokenSecret,
    })

    return NextResponse.json(
      { error: 'Missing required OAuth parameters' },
      { status: 400 }
    )
  }

  // Step 1: Create OAuth timestamp and nonce
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = crypto.randomBytes(16).toString('hex')

  // Consumer credentials
  const consumerKey = process.env.TRADEME_API_KEY ?? ''
  const consumerSecret = process.env.TRADEME_SECRET_KEY ?? ''

  // Exchange for access token
  const accessTokenURL = 'https://secure.tmsandbox.co.nz/Oauth/AccessToken'

  try {
    // For PLAINTEXT method, the signature is consumer_secret&token_secret
    const signature = `${encodeURIComponent(
      consumerSecret
    )}&${encodeURIComponent(tokenSecret)}`

    // Create Authorization header value
    const authHeader =
      `OAuth oauth_consumer_key="${encodeURIComponent(consumerKey)}", ` +
      `oauth_nonce="${encodeURIComponent(nonce)}", ` +
      `oauth_signature="${signature}", ` +
      `oauth_signature_method="PLAINTEXT", ` +
      `oauth_timestamp="${timestamp}", ` +
      `oauth_token="${encodeURIComponent(oauthToken)}", ` +
      `oauth_verifier="${encodeURIComponent(oauthVerifier)}", ` +
      `oauth_version="1.0"`

    console.log('Access token request headers:', authHeader)

    const response = await fetch(accessTokenURL, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    console.log('Access token response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Response body:', errorText)
      throw new Error(
        `Access token error: ${response.status} ${response.statusText}`
      )
    }

    const responseText = await response.text()
    console.log('Access token response text:', responseText)

    const parsedResponse = new URLSearchParams(responseText)
    const accessToken = parsedResponse.get('oauth_token')
    const accessTokenSecret = parsedResponse.get('oauth_token_secret')

    if (!accessToken || !accessTokenSecret) {
      throw new Error('Invalid response from access token endpoint')
    }

    console.log(
      'Successfully received access token:',
      accessToken.substring(0, 5) + '...'
    )

    // Store the access tokens (persist for future API calls)
    cookieStore.set('trademe_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    cookieStore.set('trademe_access_token_secret', accessTokenSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    // Delete the temporary token secret cookie
    cookieStore.delete('trademe_oauth_token_secret')

    // Redirect back to the app
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    console.log(
      'Redirecting back to:',
      `${baseUrl}/search/results?auth=success`
    )

    return NextResponse.redirect(`${baseUrl}/search/results?auth=success`)
  } catch (error: unknown) {
    console.error('TradeMe OAuth callback error:', error)
    return NextResponse.json(
      {
        error: 'Failed to complete OAuth flow',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
