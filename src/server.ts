/**
 * HTTP server factory. Exposes start/stop controls for clean lifecycle management
 * in both production and tests. Route handling is intentionally minimal -- add an
 * HTTP framework in a later phase if routing complexity warrants it.
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { randomUUID } from 'node:crypto'
import type { Logger } from 'pino'
import type { Config } from './config.js'

/** Maximum accepted request body size in bytes. Requests exceeding this are rejected. */
const MAX_BODY_BYTES = 1024 * 64 // 64 KB

/** Security headers applied to every response. */
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store',
}

/** Writes security headers onto the response before any route handler runs. */
function applySecurityHeaders(res: ServerResponse): void {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(name, value)
  }
  res.setHeader('Content-Type', 'application/json')
}

/** Drains the request body and rejects if it exceeds MAX_BODY_BYTES. */
function enforceBodyLimit(req: IncomingMessage): Promise<void> {
  return new Promise((resolve, reject) => {
    let received = 0
    req.on('data', (chunk: Buffer) => {
      received += chunk.length
      if (received > MAX_BODY_BYTES) {
        reject(new Error('request body too large'))
      }
    })
    req.on('end', resolve)
    req.on('error', reject)
  })
}

/** Handles a single incoming HTTP request. */
async function handleRequest(req: IncomingMessage, res: ServerResponse, log: Logger): Promise<void> {
  const requestId = randomUUID()
  const reqLog = log.child({ requestId, method: req.method, url: req.url, component: 'server' })

  applySecurityHeaders(res)

  try {
    await enforceBodyLimit(req)
  } catch {
    reqLog.warn('request body too large')
    res.writeHead(413)
    res.end(JSON.stringify({ code: 'PAYLOAD_TOO_LARGE', message: 'Request body exceeds size limit.' }))
    return
  }

  if (req.method === 'GET' && req.url === '/health') {
    reqLog.info('health check')
    res.writeHead(200)
    res.end(JSON.stringify({ status: 'ok' }))
    return
  }

  if (req.method === 'GET' && req.url === '/') {
    reqLog.info('hello request')
    res.writeHead(200)
    res.end(JSON.stringify({ message: 'Hello, World!' }))
    return
  }

  reqLog.warn('route not found')
  res.writeHead(404)
  res.end(JSON.stringify({ code: 'NOT_FOUND', message: 'Route not found. Check the URL and method.' }))
}

/** Creates and controls the HTTP server. */
export function createApp(config: Config, log: Logger) {
  const server = createServer((req, res) => {
    handleRequest(req, res, log).catch((err: unknown) => {
      log.error({ err, component: 'server' }, 'unhandled error in request handler')
      if (!res.headersSent) {
        res.writeHead(500)
        res.end(JSON.stringify({ code: 'SERVER_ERROR', message: 'An unexpected error occurred.' }))
      }
    })
  })

  return {
    /** Starts listening on the configured port. */
    start(): Promise<void> {
      return new Promise((resolve) => {
        server.listen(config.PORT, () => {
          log.info({ component: 'server', port: config.PORT }, 'server started')
          resolve()
        })
      })
    },

    /** Closes the server and waits for in-flight requests to complete. */
    stop(): Promise<void> {
      return new Promise((resolve, reject) => {
        server.close((err) => (err != null ? reject(err) : resolve()))
      })
    },
  }
}

export type App = ReturnType<typeof createApp>
