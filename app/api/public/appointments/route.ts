import { NextRequest, NextResponse } from 'next/server'
import { createPublicAppointment } from '../../../../lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const data = await createPublicAppointment(body)

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to create appointment' },
      { status: 500 }
    )
  }
}
