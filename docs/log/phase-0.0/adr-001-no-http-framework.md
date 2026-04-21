# ADR-001: No HTTP Framework for Hello World Phase

**Date:** 2026-04-07
**Status:** Accepted

## Context

Phase 0.0 requires two GET routes (/ and /health) with JSON responses. The project has
approved runtime dependencies including zod, pino, dotenv, and js-yaml, but no HTTP
framework is currently listed.

## Decision

Use Node.js built-in `node:http` module directly. Do not add an HTTP framework in this
phase.

## Rationale

- Two static GET routes require no routing logic, middleware, or body parsing.
- Adding a framework (e.g. Hono, Fastify, Express) for two routes introduces unjustified
  dependency weight.
- The `createApp()` factory pattern used here is framework-agnostic. Swapping in a
  framework in a later phase requires only changes to `src/server.ts`.

## Consequences

- Body parsing, middleware, and named route parameters are not available in this phase.
- If a later phase requires these, the architect should evaluate adding a framework at
  that point and update `docs/kb/requirements.md` accordingly.
