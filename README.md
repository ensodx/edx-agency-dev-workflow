# edx-agency-dev-workflow

A TypeScript project template for a 9-agent autonomous development
workflow built for Claude Code and GitHub Copilot.

[![CI](https://github.com/ensodx/edx-agency-dev-workflow/actions/workflows/ci.yml/badge.svg)](https://github.com/ensodx/edx-agency-dev-workflow/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

---

## What this template includes

**Toolchain** -- TypeScript 6 strict, ESLint 10, Prettier 3.8, Vitest 4, Node 24 LTS.

**Agentic workflow** -- A 9-agent system (researcher, architect, planner, designer,
builder, tester, quality, validator, and orchestrator) that coordinates autonomous development through structured JSON handoffs with schema validation.

**Knowledge base** -- `docs/kb/` holds the living project facts every agent reads before
starting a task. You own `requirements.md`; agents maintain the rest.

**CI/CD** -- GitHub Actions for lint, typecheck, test, and build on every PR. npm publish
with provenance on release.

---

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

```bash
curl http://localhost:3000/         # {"message":"Hello, World!"}
curl http://localhost:3000/health   # {"status":"ok"}
```

The hello world server in `src/` is the reference implementation. It shows how config
loading, error codes, pino logging, and request handling are wired together. Replace it
with your own Phase 0.1 implementation.

---

## Using this as a template

### 1. Fork or copy

Use this repository as a GitHub template or clone it directly.

### 2. Replace the placeholders

**You edit these** -- human-owned files that agents never overwrite:

| File | What to update |
|---|---|
| `package.json` | `name`, `description`, `repository`, `bugs` |
| `README.md` | Project name, description, quick start |
| `docs/kb/requirements.md` | Your project's non-negotiable constraints |
| `tasks.md` | Phase 0.1 implementation tasks |

**Agents maintain these** -- clear the example content and let agents populate them as the project evolves:

| File | What to do |
|---|---|
| `docs/kb/knowledge.yaml` | Clear everything below `index:` except the structural keys (`project`, `architecture`, `ci`, `branchModel`). Fill in your project name and phase; agents update the rest after each phase. |
| `docs/kb/github-project.yaml` | Replace the `TODO` placeholder values with your actual GitHub Projects V2 IDs. Get them from your project board URL and the GitHub API. |

### 3. Clear the hello world src/

Delete `src/` and implement your own Phase 0.1. The `docs/log/phase-0.0/` handoffs show
exactly what a completed implementation cycle looks like -- use them as a reference.

### 4. Start the orchestrator

Open Claude Code and invoke the orchestrator agent with your Phase 0.1 requirements.
It reads `docs/kb/` and `tasks.md`, then coordinates the full build cycle autonomously.

---

## The agentic workflow

### Agents

Nine specialised agents coordinate work through a structured handoff chain. Each reads
all prior handoffs, does its job, and writes the next.

| Agent | Role |
|---|---|
| **orchestrator** | Coordinates all agents, routes on handoff fields, escalates to user |
| **researcher** | Researches libraries and patterns; writes KB files before architect runs |
| **architect** | Designs the solution, defines acceptance criteria, writes ADRs |
| **planner** | Sequences architect decisions into `tasks.md`; creates GitHub issues |
| **designer** | Designs CLI output, error messages, and user-facing copy |
| **builder** | Implements code informed by all prior handoffs |
| **tester** | Writes tests against acceptance criteria; runs compliance checks |
| **quality** | Scores 4 required dimensions 1-10, fixes anything below 9, max 3 passes |
| **validator** | Adversarial structural check -- PASS/FAIL only, read-only |

### Handoff flow

```
researcher  -->  handoff-researcher.json  -->  architect
architect   -->  handoff-architect.json   -->  planner
planner     -->  handoff-planner.json     -->  designer + builder  (GitHub issues created)
designer    -->  handoff-designer.json    -->  builder
builder     -->  handoff-builder.json     -->  tester
tester      -->  handoff-tester.json      -->  quality
quality     -->  handoff-quality.json     -->  validator
validator   -->  handoff-validator.json   -->  PASS: close issues, open PR
                                               FAIL: back to builder (max 3 retries)
```

Handoffs are written to `docs/log/phase-N/` and validated against the JSON schemas in
`docs/log/_templates/schemas/` before being committed. See `docs/log/phase-0.0/` for a
reference example of a finished phase (pre-researcher pipeline).

### Phase quality gates

Each phase must clear three gates before moving on:

1. **Quality** -- all 4 required dimensions score >= 9 (fixes applied inline)
2. **Validator** -- no layer violations, interface contracts respected, no data leaks
3. **Go/no-go** -- orchestrator confirms the phase objective is fully met

### Escalation

When an agent cannot proceed, the orchestrator opens a GitHub issue with label
`agent-escalation` and pauses. The issue contains the exact question and all context
needed to answer it. Resolve it, close the issue, and the workflow resumes.

---

## Directory structure

```
.claude/agents/        Claude Code subagent definitions (9 agents)
.github/agents/        GitHub Copilot agent definitions (kept in sync with .claude/agents/)
.github/workflows/     CI (lint, typecheck, test, build) and npm release
docs/
  kb/
    knowledge.yaml     Living architecture facts -- updated by agents after each phase
    requirements.md    Non-negotiable constraints -- the only human-owned document
    github-project.yaml  GitHub Projects V2 IDs for the orchestrator
  log/
    _templates/        Handoff templates and JSON schemas for all 8 handoff types
    phase-0.0/         Example: completed hello world phase (reference this)
    phase-N/           One folder per phase, created by the orchestrator
src/                   Hello world reference implementation (replace for your project)
tasks.md               Phase task board -- updated by the orchestrator each phase
CLAUDE.md              Build commands and workflow guidance for Claude Code
```

---

## Commands

```bash
npm install          # install dependencies
npm run dev          # run with live reload (node --watch)
npm run build        # compile TypeScript to dist/
npm run lint         # ESLint
npm run format       # Prettier write
npm run format:check # Prettier check (used in CI)
npm run test         # Vitest
npm run typecheck    # tsc --noEmit
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch model, code standards, and PR
checklist.

## Security

See [SECURITY.md](SECURITY.md) to report a vulnerability privately.

## License

Copyright 2026 [Enso DX](https://ensodx.com)

Licensed under the [Apache License, Version 2.0](LICENSE).
