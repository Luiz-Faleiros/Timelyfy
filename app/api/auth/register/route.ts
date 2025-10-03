import { NextResponse } from 'next/server'
import { register as externalRegister } from '@/lib/api'

type Body = {
  email?: string
  password?: string
  name?: string
  role?: string
  adminInviteCode?: string
}

export async function POST(req: Request) {
  try {
    const body: Body = await req.json()

    const { email, password, name, role, adminInviteCode } = body

    if (!email || !password || !name || !role) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }

  // If role is ADMIN, require server-side invite code match
  const serverInvite = process.env.NEXT_PUBLIC_ADMIN_INVITE_CODE

    if (role === 'ADMIN') {
      if (!serverInvite) {
        return NextResponse.json({ message: 'Server not configured with ADMIN_INVITE_CODE' }, { status: 500 })
      }

      if (adminInviteCode !== serverInvite) {
        return NextResponse.json({ message: 'Invalid admin invite code' }, { status: 401 })
      }
    }

    // Forward the registration to the external API defined in lib/api.register
    try {
      const data = await externalRegister({ email, password, name, role, adminInviteCode })
      return NextResponse.json(data, { status: 201 })
    } catch (err: any) {
      // externalRegister throws with a message; forward it
      return NextResponse.json({ message: err?.message || 'External register failed' }, { status: 502 })
    }
  } catch (err: any) {
    return NextResponse.json({ message: err?.message ?? 'Invalid JSON' }, { status: 400 })
  }
}
