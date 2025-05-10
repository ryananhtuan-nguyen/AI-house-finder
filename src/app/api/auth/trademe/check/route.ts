import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const accessToken = cookies().get('trademe_access_token')?.value
  const accessTokenSecret = cookies().get('trademe_access_token_secret')?.value

  return NextResponse.json({
    authenticated: !!accessToken && !!accessTokenSecret,
  })
}
