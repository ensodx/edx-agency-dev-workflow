# requirements.md

User constraints and non-negotiables. Every agent must read this before making any
technology, design, or implementation decision. These rules are not up for debate.

Replace the example content below with your project's actual constraints when you start.

---

## Validation Philosophy

**Both a confirming and a disconfirming result are equally valid outcomes.**

The goal is not to prove the code works -- it is to measure honestly whether it does.
A failing test with clean data is strictly better than a passing test achieved by
softening assertions, deleting tests, or adjusting code solely to satisfy a test.
Findings -- including negative ones -- are the product of this work.

**Consequences for agents:**
- Tester: never weaken an assertion to make a test pass. A failing test that accurately documents a gap must be preserved and reported.
- Builder: when a test fails, fix the underlying code. Never modify a test to make it pass unless the test itself is provably wrong (and document why).
- Quality: score test integrity as part of test quality. Tests that have been softened to achieve green CI score 1.
- Reviewer: a test deleted or weakened without documented justification is a blocking issue.

---

## Runtime & Toolchain

| Concern | Requirement |
|---|---|
| Node.js | 24 LTS (`>=24.0.0`). No support for older versions. |
| TypeScript | 6.x strict mode. No `@ts-ignore`, no `as any`, no type suppression of any kind. |
| Module system | ESM only (`"type": "module"`). No CommonJS. |
| Module resolution | `NodeNext`. |
| Test framework | Vitest 4.x. No Jest, no Mocha. |
| Linting | ESLint 10 flat config (`eslint.config.js`) + `typescript-eslint`. |
| Package manager | npm. No yarn, no pnpm. |

---

## Architecture

<!-- Replace with your project's layer model and constraints. Example below. -->

| Concern | Requirement |
|---|---|
| Layer model | HTTP layer (`src/server.ts`) must not import the entry point (`src/index.ts`). |
| Validation | Zod at config and API boundaries only -- not for internal type assertions. |
| Logging | pino structured JSON. No sensitive data in logs at any level. |
| Errors | `AppErrorCode` enum for all errors. No ad hoc error strings. |

---

## Approved Runtime Dependencies

Only these packages may be added as runtime dependencies. Any addition must be justified
against a hand-rolled alternative before being approved.

| Package | Purpose |
|---|---|
| `zod` | Config and API boundary validation |
| `js-yaml` | YAML config parsing |
| `dotenv` | `.env` loading |
| `pino` | Structured JSON logging |

**Explicitly prohibited:** ORM of any kind, cosmiconfig.

---

## Design Rules

<!-- Replace with your project's interface and UX constraints. Example below. -->

| Concern | Requirement |
|---|---|
| Error messages | Must state: what happened, why, and what to do next. |
| CLI output | Color must never be the only way to convey information (WCAG 1.4.1). |
| Web UI (if added) | WCAG 2.1 AA minimum. ARIA labels on all interactive elements. Keyboard navigable. |

---

## Security & Compliance

| Concern | Requirement |
|---|---|
| Secrets | Never commit secrets. `.env` is gitignored. No secrets in logs at any level. |
| Dependencies | No dependency with a known high-severity CVE. `npm audit --audit-level=high` runs in CI. |
| Security headers | Every HTTP response must include `X-Content-Type-Options`, `X-Frame-Options`, `Cache-Control: no-store`. |
| Request limits | All HTTP endpoints must enforce a request body size limit. |
| Input validation | All external input validated at the boundary (Zod). Never passed raw to queries, templates, or shell. |

---

## GDPR & Data Privacy

| Concern | Requirement |
|---|---|
| PII in logs | Never log names, email addresses, IP addresses, or any user-identifiable data. |
| PII in errors | Error responses must not echo back user-supplied data that may contain PII. |
| Data minimisation | Only collect and process data the feature explicitly requires. No speculative capture. |
| Retention | Define and document retention periods for any stored data before implementing persistence. |
| Data flows | Any feature that sends data to a third party must be documented in `docs/kb/knowledge.yaml` under `dataFlows` before implementation. |

---

## Security Event Logging (OCSF)

Security-relevant events must be logged in a structured format compatible with
OCSF 1.8.0 (Open Cybersecurity Schema Framework). This applies to:

- Authentication attempts (success and failure)
- Authorisation decisions (allow and deny)
- Configuration changes at runtime
- Circuit breaker state changes
- Any event that would appear in a security audit trail

**Required fields per event:** `class_uid`, `activity_id`, `time`, `severity_id`, `message`.

When designing a feature that generates security events, the architect must produce a
`docs/kb/ocsf-<feature>.md` mapping the feature's event types to OCSF event classes.

Events must never include secrets, PII, prompt content, or response content at any log level.

---

## Infrastructure

| Concern | Requirement |
|---|---|
| Hosting | To be defined per project. |
