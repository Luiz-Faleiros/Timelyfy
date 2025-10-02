import { NextResponse } from 'next/server'

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
    const serverInvite = process.env.ADMIN_INVITE_CODE

    if (role === 'ADMIN') {
      if (!serverInvite) {
        return NextResponse.json({ message: 'Server not configured with ADMIN_INVITE_CODE' }, { status: 500 })
      }

      if (adminInviteCode !== serverInvite) {
        return NextResponse.json({ message: 'Invalid admin invite code' }, { status: 401 })
      }
    }

    // Aqui você integraria com seu sistema de usuários / banco de dados.
    // Para demonstração, retornamos sucesso sem persistir.

    const created = {
      id: Math.random().toString(36).slice(2, 9),
      email,
      name,
      role,
    }

    return NextResponse.json({ message: 'Created', user: created }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message ?? 'Invalid JSON' }, { status: 400 })
  }
}
