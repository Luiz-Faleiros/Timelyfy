import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { cancelAppointment } from '@/lib/api'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await cancelAppointment(params.id, token)

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (err: any) {
    const message = err?.message || 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
