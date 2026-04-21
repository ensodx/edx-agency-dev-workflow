/**
 * Configuration loading and validation.
 * Reads environment variables, validates them with Zod, and exports a typed Config.
 * Import this module before any module that reads process.env directly.
 */
import 'dotenv/config'
import { z } from 'zod'
import { AppErrorCode } from './errors.js'

const schema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
})

export type Config = z.infer<typeof schema>

/** Loads and validates config from environment variables. Throws on invalid config. */
export function loadConfig(): Config {
  const result = schema.safeParse(process.env)
  if (!result.success) {
    throw new Error(`${AppErrorCode.CONFIG_INVALID}: ${result.error.message}`)
  }
  return result.data
}
