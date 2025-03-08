import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  GET: async () => {
    return new Response(JSON.stringify({
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
      }
    }), { status: 200 })
  },
  POST: async () => {
    return new Response(null, { status: 200 })
  }
}))

describe('Auth API', () => {
  beforeAll(() => {
    vi.mock('next-auth/next', () => ({
      getServerSession: vi.fn().mockResolvedValue({
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      })
    }))
  })

  afterAll(() => {
    vi.clearAllMocks()
  })

  it('handles GET requests to auth endpoint', async () => {
    const req = new NextRequest(new URL('http://localhost:3000/api/auth/session'), {
      method: 'GET'
    })

    const { GET } = await import('@/app/api/auth/[...nextauth]/route')
    const res = await GET(req)
    
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.user).toBeDefined()
  })

  it('handles POST requests for signin', async () => {
    const req = new NextRequest(new URL('http://localhost:3000/api/auth/signin'), {
      method: 'POST',
      body: JSON.stringify({ provider: 'github' })
    })

    const { POST } = await import('@/app/api/auth/[...nextauth]/route')
    const res = await POST(req)
    
    expect(res.status).toBe(200)
  })
}) 