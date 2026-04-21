import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import pino from 'pino'
import { createApp } from './server.js'

const BASE = 'http://localhost:3099'
const app = createApp({ PORT: 3099, LOG_LEVEL: 'info' }, pino({ level: 'silent' }))

beforeAll(() => app.start())
afterAll(() => app.stop())

describe('GET /', () => {
  it('returns 200 with Hello World message', async () => {
    const res = await fetch(`${BASE}/`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ message: 'Hello, World!' })
  })
})

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await fetch(`${BASE}/health`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })
})

describe('unknown route', () => {
  it('returns 404 with NOT_FOUND code', async () => {
    const res = await fetch(`${BASE}/unknown`)
    expect(res.status).toBe(404)
    const body = (await res.json()) as { code: string }
    expect(body.code).toBe('NOT_FOUND')
  })
})
