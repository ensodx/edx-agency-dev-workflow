# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[0.1.0]: https://github.com/ensodx/edx-agency-dev-workflow/releases/tag/v0.1.0
