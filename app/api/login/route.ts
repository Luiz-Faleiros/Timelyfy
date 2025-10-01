import { NextResponse } from 'next/server'
import { login as backendLogin } from '../../../lib/api'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const data = await backendLogin(email, password)

    // If backend returned a token, set it as a HttpOnly cookie
    const token = data?.access_token || null

    const response = NextResponse.json({ success: true, data })

    if (token) {
      // Set cookie for 7 days
      const maxAge = 60 * 60 * 24 * 7
      response.cookies.set('token', token, { httpOnly: true, path: '/', maxAge })
    }

    return response
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
