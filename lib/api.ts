export const BASE_URL = 'https://tcc-backend-vvd4.onrender.com'

export async function getSchedules(params: Record<string, string> = {}, token?: string) {
  const qs = new URLSearchParams(params).toString()
  const url = `${BASE_URL}/schedules${qs ? `?${qs}` : ''}`
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(url, {
    method: 'GET',
    headers,
  })
  const data = await res.json()
  if (!res.ok) {
    const message = data?.message || data?.error || 'Fetch schedules failed'
    throw new Error(message)
  }
  return data
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await res.json()

  if (!res.ok) {
    const message = data?.message || data?.error || 'Login failed'
    throw new Error(message)
  }

  return data
}

export async function register(payload: any) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    const message = data?.message || data?.error || 'Register failed'
    throw new Error(message)
  }

  return data
}

export async function createService(payload: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}/services`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  
  const data = await res.json()

  if (!res.ok) {
    const message = data?.message || data?.error || 'Create service failed'
    throw new Error(message)
  }

  return data
}

export async function getServices(token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}/services`, {
    method: 'GET',
    headers,
  })

  const data = await res.json()

  if (!res.ok) {
    const message = data?.message || data?.error || 'Fetch services failed'
    throw new Error(message)
  }

  return data
}

export async function updateService(id: string, payload: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}/services/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    const message = data?.message || data?.error || 'Update service failed'
    throw new Error(message)
  }

  return data
}

export async function deleteService(id: string, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}/services/${id}`, {
    method: 'DELETE',
    headers,
  })

  const data = await res.json()

  if (!res.ok) {
    const message = data?.message || data?.error || 'Delete service failed'
    throw new Error(message)
  }

  return data
}

export async function getPublicSchedules(id: string, params: Record<string, string> = {}, token?: string) {
  const qs = new URLSearchParams(params).toString()
  const url = `${BASE_URL}/public/services/${id}/schedules${qs ? `?${qs}` : ''}`
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, { method: 'GET', headers })
  const data = await res.json()
  if (!res.ok) {
    const message = data?.message || data?.error || 'Fetch public schedules failed'
    throw new Error(message)
  }
  return data
}

export async function createPublicAppointment(payload: any) {
  const res = await fetch(`${BASE_URL}/public/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    const message = data?.message || data?.error || 'Create appointment failed'
    throw new Error(message)
  }

  return data
}

export async function cancelAppointment(id: string, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}/appointments/${id}/cancel`, {
    method: 'PATCH',
    headers,
  })

  const data = await res.json()

  if (!res.ok) {
    const message = data?.message || data?.error || 'Cancel appointment failed'
    throw new Error(message)
  }

  return data
}
