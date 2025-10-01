import { NextResponse } from 'next/server'
import { getPublicSchedules } from '../../../../../../lib/api'
import { cookies } from 'next/headers'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value

    // build params from incoming query string
    const url = new URL(req.url)
    const search = Object.fromEntries(url.searchParams.entries())

    const data = await getPublicSchedules(params.id, search, token)

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
