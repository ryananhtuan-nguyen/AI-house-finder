import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('trademe_access_token')?.value
  const accessTokenSecret = cookieStore.get(
    'trademe_access_token_secret'
  )?.value

  return NextResponse.json({
    authenticated: !!accessToken && !!accessTokenSecret,
  })
}
