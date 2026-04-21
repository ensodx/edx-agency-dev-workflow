# [project-name] -- Copilot Instructions

Brief description of the project goes here.

## Knowledge base

- `docs/kb/knowledge.yaml` -- project-wide facts: architecture, status, infrastructure, decisions (machine-readable)
- `docs/kb/requirements.md` -- all constraints and non-negotiables: the only human-owned document (TypeScript rules, approved deps, architecture, security, design rules)
- `docs/kb/<topic>.yaml|json|md` -- researcher findings, one focused file per topic
- `docs/log/phase-N/` -- per-phase JSON handoffs + ADR decision records
- `tasks.md` -- phase task board (root of repo, not docs/)

Read all of the above before making any implementation or design decision.
Current phase: see `tasks.md`. Do not implement tasks from later phases.

---

## Core principles

**Think before coding.** Surface assumptions and tradeoffs explicitly.
If uncertain, ask. If multiple interpretations exist, present them -- do not pick silently.

**Simplicity first.** Write the minimum code that solves the problem.
No features beyond what was asked. No abstractions for single-use code.

**Surgical changes.** Do not improve adjacent code, comments, or formatting.
Do not refactor things that are not broken.

**Goal-driven execution.** Transform tasks into verifiable success criteria.
Define checkpoints rather than vague goals like "make it work."

---

## Commands

```bash
npm install          # install dependencies
npm run build        # compile TypeScript to dist/
npm run dev          # run with live reload (node --watch)
npm run lint         # eslint src/
npm run format       # prettier --write src/
npm run format:check # prettier --check src/ (used in CI)
npm run test         # vitest run
npm run typecheck    # tsc --noEmit
```

---

## Coding standards

See `docs/kb/requirements.md` for the authoritative rules on TypeScript, dependencies,
architecture, logging, error handling, and security.

Key non-negotiables:
- TypeScript 6 strict mode. No `@ts-ignore`, no `as any`, no type suppression.
- ESM only. No CommonJS.
- Approved runtime deps only -- see requirements.md. No new deps without justification.
- `AppErrorCode` enum for all errors. No ad hoc error strings.
- Pino structured logging. No sensitive data in logs at any level.

---

## Testing policy

| Category | Blocking? |
|---|---|
| Contract tests (schema compliance, config validation) | Yes |
| Integration tests | Yes |
| Edge case tests (malformed input, boundary conditions, partial failures) | No - document and triage |
| Performance tests | No until Phase 0.9 |

A failing test is a valid outcome. Do not weaken assertions or delete tests to make CI green.

---

## Agent system

This project uses a 9-agent autonomous engineering system. Agents communicate via JSON handoffs
in `docs/log/phase-N/`. Each handoff must be validated against its schema before being written.

| Agent | Role |
|---|---|
| orchestrator | Coordinates all agents, routes on handoff fields, escalates to user |
| researcher | Researches libraries and patterns; writes KB files before architect runs |
| architect | Designs the solution, defines acceptance criteria, writes ADRs |
| planner | Sequences architect decisions into tasks.md; creates GitHub issues |
| designer | Designs UX, CLI output, locale strings, accessibility |
| builder | Implements code informed by all prior handoffs |
| tester | Writes tests against acceptance criteria; runs compliance checks |
| quality | Scores 4 required dimensions 1-10, fixes anything below 9, max 3 passes |
| validator | Adversarial structural check -- PASS/FAIL only, read-only |

## Phase quality gates

Each phase requires three sequential gates before moving on:
1. **Quality** -- all 4 required dimensions score >= 9 (fixes applied inline)
2. **Validator** -- no layer violations, contracts respected, privacy compliant
3. **Go/No-go** -- phase objective and expected outcome confirmed; proceed only when met

## Handoff schema validation

Before writing any handoff to `docs/log/phase-N/`, validate against its schema:

Phase folders use the exact phase number from `tasks.md`: `docs/log/phase-0.1/`, `docs/log/phase-0.2/` etc.

| File | Written by | Schema |
|---|---|---|
| `handoff-researcher.json` | researcher | `docs/log/_templates/schemas/handoff-researcher.schema.json` |
| `handoff-architect.json` | architect | `docs/log/_templates/schemas/handoff-architect.schema.json` |
| `handoff-planner.json` | planner | `docs/log/_templates/schemas/handoff-planner.schema.json` |
| `handoff-designer.json` | designer | `docs/log/_templates/schemas/handoff-designer.schema.json` |
| `handoff-builder.json` | builder | `docs/log/_templates/schemas/handoff-builder.schema.json` |
| `handoff-tester.json` | tester | `docs/log/_templates/schemas/handoff-tester.schema.json` |
| `handoff-quality.json` | quality | `docs/log/_templates/schemas/handoff-quality.schema.json` |
| `handoff-validator.json` | validator | `docs/log/_templates/schemas/handoff-validator.schema.json` |

On rearchitect loops (`[~]`): rename existing `handoff-architect.json` to `handoff-architect.v1.json` before writing the new version.

- All `required` fields must be present and non-empty.
- Enum fields must use only the listed values -- never free text.
- `retryCount` must be incremented on retry, never reset to 0.
