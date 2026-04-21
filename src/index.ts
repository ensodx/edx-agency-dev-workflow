/**
 * Application entry point.
 * Loads config, initialises the logger, creates the server, and starts listening.
 */
import pino from 'pino'
import { loadConfig } from './config.js'
import { createApp } from './server.js'

const config = loadConfig()
const log = pino({ level: config.LOG_LEVEL })
const app = createApp(config, log)

await app.start()
