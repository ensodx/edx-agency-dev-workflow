# [project-name] -- Project Tasks

## Agent pipeline (per phase)

0. preflight -- verify branch, gh auth (repo scope), clean working tree, Node >= 24
1. researcher -- KB files for all frameworks/libraries/patterns used in this phase
2. architect -- design, acceptance criteria, ADRs
3. planner -- ordered task list, file assignments, parallel groups; creates GitHub issues immediately after writing handoff
4. designer -- locale strings, CLI output specs, error message copy (no research; inputs already in handoffs)
5. builder -- implementation; reads designer output BEFORE writing error codes or user-facing strings
6. tester -- test coverage + compliance grep checks incl. untracked temp files (required in handoff)
7. quality -- scores 4 dimensions (1-10), fixes everything below 9, runs tests after fixes
8. validator -- binary PASS/FAIL
9. On PASS: close GitHub issues, update project board, open PR phase-N.N -> develop, write phase-summary.md

## Status markers
- `[ ]` pending
- `[-]` in progress
- `[x]` done
- `[~]` routed back to architect (builder signalled `needs-rearchitect`)
- `[!]` blocked -- escalated to user or awaiting dependency

Phase status board. Updated by the orchestrator. Committed to the repository.

## Template setup -- complete these before starting Phase 0.1

- [ ] Fork or copy this repository
- [ ] `package.json` -- update `name`, `description`, `repository`, `bugs`
- [ ] `README.md` -- update project name, description, quick start
- [ ] `CONTRIBUTING.md` -- replace `[owner]/[repo]` placeholders with your GitHub repo
- [ ] `docs/kb/requirements.md` -- replace example constraints with your project's rules
- [ ] `docs/kb/knowledge.yaml` -- clear example content below `index:`; fill in project name and phase
- [ ] `docs/kb/github-project.yaml` -- replace `TODO` values with your GitHub Projects V2 IDs
- [ ] `tasks.md` -- replace this section with your Phase 0.1 tasks
- [ ] Delete `src/` -- the hello world is a reference only; implement your own

## Phase 0.1 -- Backport agentic system improvements from aylin

### Critical: pipeline structure and new agents

- [x] `CLAUDE.md` -- add Preflight section (verify branch, gh auth, clean working tree, Node >= 24)
- [x] `CLAUDE.md` -- add full Agent Pipeline section (researcher -> architect -> planner -> designer -> builder -> tester -> quality -> validator) with per-agent responsibility breakdown and routing rules
- [x] `CLAUDE.md` -- expand Builder section with explicit pre-implementation checklist
- [x] `CLAUDE.md` -- expand Tester section with required compliance grep checks (ts-ignore, as any, require() in src, layer violations, ESM imports, untracked temp files)
- [x] `CLAUDE.md` -- add GitHub Issues section (issue creation lifecycle, planner responsibility)
- [x] `CLAUDE.md` -- add Branch & PR section (naming conventions, PR body requirements)
- [x] `CLAUDE.md` -- add Phase Summary section (template reference and required coverage)
- [x] `tasks.md` -- add Agent Pipeline quick-reference comment block in header (numbered 0-9 steps with preflight)
- [x] `.claude/agents/researcher.md` -- create researcher agent definition (KB file creation, scope constraints, no-code rule)
- [x] `.github/agents/researcher.agent.md` -- create GitHub Copilot equivalent for researcher
- [x] `.claude/agents/quality.md` -- already existed; no change needed
- [x] `.github/agents/quality.agent.md` -- already existed; no change needed

### Critical: handoff schema and template additions

- [x] `docs/log/_templates/handoff-researcher.json` -- create researcher handoff template (topicsResearched, kbFilesCreated, openQuestions)
- [x] `docs/log/_templates/schemas/handoff-researcher.schema.json` -- create schema with required fields
- [x] `docs/log/_templates/handoff-planner.json` -- create planner handoff template (tasks T-N pattern, parallelGroups, githubIssues)
- [x] `docs/log/_templates/schemas/handoff-planner.schema.json` -- create schema with required fields
- [x] `docs/log/_templates/handoff-quality.json` -- create quality handoff template (scores 1-10 per dimension, fixesMade, blockingIssues, testsRun)
- [x] `docs/log/_templates/schemas/handoff-quality.schema.json` -- create schema with required fields
- [x] `docs/log/_templates/phase-summary.md` -- create phase summary template (objective, what was built, test results, AC status, decisions, next phase dependencies)

### Important: existing schema enhancements

- [x] `docs/log/_templates/schemas/handoff-builder.schema.json` -- add `openQuestionsResolution` required field (question + resolution per open question from planner)
- [x] `docs/log/_templates/handoff-builder.json` -- add `openQuestionsResolution` example entry
- [x] `docs/log/_templates/schemas/handoff-tester.schema.json` -- add required `complianceChecks` object (7 boolean fields + notes)
- [x] `docs/log/_templates/handoff-tester.json` -- add `complianceChecks` example entry

### Important: orchestrator expansion

- [x] `.claude/agents/orchestrator.md` -- expand workflow section with step-by-step phase execution breakdown (steps 1-8: research, architect, plan, branch, build, test, quality, validate) and routing tables for builder status/blockedReason handling
- [x] `.github/agents/orchestrator.agent.md` -- apply equivalent expansions

## Phase 0.0 -- Hello World (template reference, complete)

- [x] Open-source community files (LICENSE, README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, CHANGELOG)
- [x] GitHub Actions CI -- lint, typecheck, test, build on Node 24 LTS
- [x] GitHub Actions release -- npm publish with provenance on GitHub Release
- [x] Dependabot -- weekly npm + actions updates
- [x] Issue and PR templates (bug, feature, agent escalation)
- [x] TypeScript project config (package.json, tsconfig.json, eslint.config.js, vitest.config.ts)
- [x] .env.example, .nvmrc, .editorconfig
- [x] CLAUDE.md + docs/kb/ (knowledge.yaml, requirements.md, github-project.yaml)
- [x] 8-agent definitions (.claude/agents/, .github/agents/)
- [x] Handoff templates + JSON schemas (docs/log/_templates/)
- [x] src/ hello world -- config, errors, server, health endpoint, tests
- [x] docs/log/phase-0.0/ -- example completed phase with all handoffs and ADR
