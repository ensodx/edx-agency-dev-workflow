# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] -- 2026-06-11

### Added
- HITL path for strategic blockers: new `needs-human-approval` `blockedReason` value in
  builder schema; orchestrator stops and creates a P0 GitHub issue rather than spawning
  the architect autonomously
- `docs/log/_templates/exception-report.md`: template builders fill in before setting
  `needs-human-approval`; captures the blocker, external constraint, options, and what
  approval is needed to proceed
- Rearchitect circuit breaker: orchestrator counts `handoff-architect.v*.json` files
  before spawning the architect; escalates to HITL after 2 rearchitect attempts
- Builder retry limit: after 3 failed fix attempts on the same build/test error within
  one invocation, builder self-escalates to `needs-human-approval`
- `scripts/compact-output.js`: deterministic terminal output filter; strips npm noise
  lines, truncates stack traces beyond 5 frames, compresses identical adjacent lines,
  and forwards the original exit code
- `npm run build:ci` and `npm run test:ci`: noise-reduced build/test variants for agent
  contexts; builder and quality agents now use these instead of bare `build`/`test`
- `observability` key in `docs/kb/knowledge.yaml`: documents OTel SDK and
  `pino-opentelemetry-transport` as patterns to consider at HTTP/integration boundaries;
  discoverable by the architect, not mandatory
- `improvements.md`: research document evaluating 7 workflow improvement proposals with
  feasibility, value, and implementation recommendations
- `.npmignore`: excludes source, docs, agent definitions, and test output from any
  accidental publish

### Changed
- Orchestrator model changed from `claude-opus-4-6` to `claude-sonnet-4-6`; routing
  decisions are deterministic table lookups that do not require deep reasoning
- Builder and quality agents use `npm run test:ci` in post-implementation verification
  and fix passes
- `release.yml` publish job disabled with `if: false`; this project is not published
  to npm
- `package.json` marked `"private": true`; removed `prepublishOnly` script and
  `publishConfig` block

## [0.1.0] -- 2026-06-11

### Added
- 9-agent pipeline: researcher, architect, planner, designer, builder, tester,
  quality, validator, orchestrator with structured JSON handoffs and schema
  validation (docs/log/_templates/)
- GitHub issue lifecycle managed by the planner agent; orchestrator closes
  issues and opens PR on validator PASS
- Binary PASS/FAIL validator with max 3 retry loops before user escalation
- VS Code launch configs: F5 (debug) and Ctrl+F5 (run) both run npm build
  first via preLaunchTask
- VS Code Test Explorer integration via vitest.explorer extension
- VS Code extension recommendations: vitest.explorer, dbaeumer.vscode-eslint,
  esbenp.prettier-vscode
- npm scripts: test:watch, test:coverage
- docs/log/phase-0.0/ -- complete reference example of a finished phase
  with all handoffs and an ADR
- docs/kb/requirements.md -- human-owned constraints file; agents never
  overwrite it
- docs/kb/knowledge.yaml -- living architecture facts updated by agents
  after each phase
- tsx devDependency for reliable TypeScript execution in dev (handles ESM
  module resolution and TypeScript enums correctly on all platforms)
- README orchestrator prompt examples: responsive typography showcase and
  a Zod + OCSF logging endpoint

### Changed
- Dev script switched from node --experimental-strip-types to tsx watch;
  fixes module resolution on Windows and correct handling of TypeScript enums
- Server start() now falls back to an OS-assigned port on EADDRINUSE instead
  of throwing an unhandled error
- .vscode/ removed from .gitignore so VS Code config ships with the template
- tasks.md cleaned up: removed completed Phase 0.0 and Phase 0.1 history
  that added no value to forks
- PR template: removed JSDoc checklist item that contradicted the no-comments
  coding standard in CLAUDE.md

### Dependencies
- zod 4.4.3
- typescript-eslint 8.59.3
- eslint 10.3.0
- vitest 4.1.6
- typescript 6.0.3
- Node 25 in CI and .nvmrc

[0.1.1]: https://github.com/ensodx/edx-agency-dev-workflow/releases/tag/v0.1.1
[0.1.0]: https://github.com/ensodx/edx-agency-dev-workflow/releases/tag/v0.1.0
