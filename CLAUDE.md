# CLAUDE.md

Guidance for Claude Code when working in this repository.

- Project knowledge: [docs/kb/knowledge.yaml](docs/kb/knowledge.yaml) (machine-readable facts)
- Project requirements & constraints: [docs/kb/requirements.md](docs/kb/requirements.md) (human-owned, authoritative)
- Architect research findings: [docs/kb/](docs/kb/) (one focused file per topic, .yaml/.json/.md)
- Phase execution logs & handoffs: [docs/log/](docs/log/) (per-phase JSON handoffs + ADR records)
- Phase tasks: [tasks.md](tasks.md) (root of repo, not docs/)

Read all of the above before implementing anything.

---

## Core Principles

**Think before coding.** Surface assumptions and tradeoffs explicitly.
If uncertain, ask. If multiple interpretations exist, present them -- don't pick silently.

**Simplicity first.** Write the minimum code that solves the problem.
No features beyond what was asked. No abstractions for single-use code.

**Surgical changes.** When editing, do not improve adjacent code, comments, or formatting.
Do not refactor things that aren't broken.

**Goal-driven execution.** Transform tasks into verifiable success criteria with a brief plan.
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

Run a single test file: `npx vitest run src/path/to/file.test.ts`

---

## Coding Standards

See [docs/kb/requirements.md](docs/kb/requirements.md) for the authoritative rules on TypeScript,
dependencies, architecture, logging, error handling, and security.

---

## Testing Policy

| Category | Blocking? |
|---|---|
| Contract tests (schema compliance, config validation) | Yes |
| Integration tests (end-to-end request flow) | Yes |
| Edge case tests (malformed input, boundary conditions, partial failures) | No - document and triage |
| Performance tests | No until Phase 0.9 |

A failing test is a valid outcome. Do not weaken assertions or delete tests to make CI green.

---

## Preflight

Before starting any phase, verify the environment is ready. If any check fails, stop and
surface the problem to the user before running any agent.

```bash
# 1. Confirm on the correct feature branch (not develop or main)
git branch --show-current   # must be phase-N.N

# 2. Confirm gh CLI is authenticated with required scopes
gh auth status              # must show 'repo' scope

# 3. Confirm working tree is clean
git status --short          # must be empty (no uncommitted changes from prior work)

# 4. Confirm Node version
node --version              # must be >= 24.0.0
```

---

## Agent Pipeline

Each phase runs the following agents in order. Each agent reads ALL previous handoffs
before writing its own. No agent skips this step.

```
researcher -> architect -> planner -(issues created)-> designer -> builder -> tester -> quality -> validator
                                                                                  ^                     |
                                                                                  |     FAIL (max 3) ---+
                                                                               PASS -> close issues -> PR -> phase-summary
```

On builder `blocked` status: route back to architect for a rearchitect loop.
On validator FAIL: builder fixes blocking issues, quality re-runs, validator re-runs (max 3 retries; on 4th failure, escalate to user).

**Responsibility split:**
- The **planner** owns GitHub issue creation. Issues are created immediately after the planner
  handoff is written, before designer or builder run. This ensures issues track in-flight work,
  not completed work.
- The **orchestrator** owns sequencing, routing, and post-PASS cleanup (close issues, open PR,
  write phase-summary). It does not create issues -- that is the planner's job.

### researcher
Runs FIRST, before the architect designs anything.

**Job:** Identify every framework, library, and non-trivial pattern the phase will use.
For each one: research the current version's API, known gotchas, and recommended patterns
relevant to this phase. Write a focused KB file to `docs/kb/<topic>.md`. Summarize
key findings that the architect must know before making design decisions.

**Output:** `docs/log/phase-N.N/handoff-researcher.json` + KB files in `docs/kb/`.

**KB file scope:** One file per library/pattern. Keep each file under ~150 lines.
Cover: version in use, the specific API surface this project uses, gotchas, and
recommended patterns. Do not copy-paste docs -- synthesize findings relevant to the project.

**Handoff schema:** `docs/log/_templates/schemas/handoff-researcher.schema.json`

### architect
Reads researcher handoff and KB files. Designs the implementation.

**Output:** `docs/log/phase-N.N/handoff-architect.json` + ADR files.

**Handoff schema:** `docs/log/_templates/schemas/handoff-architect.schema.json`

### planner
Reads architect handoff. Produces ordered task list with file assignments and parallel groups.
Then creates GitHub issues for each logical deliverable group and records them in the handoff.

**GitHub issue creation (do this after writing the handoff, before any other agent runs):**
- One issue per logical deliverable group (not one per task -- group related tasks)
- Title: `[Phase N.N] <deliverable name>`
- Body: phase name, deliverable description, AC references, log path
- Use `gh issue create` with the project's GitHub repo
- Record each issue URL in the `githubIssues` array in the handoff

**Output:** `docs/log/phase-N.N/handoff-planner.json` (includes `githubIssues`)

**Handoff schema:** `docs/log/_templates/schemas/handoff-planner.schema.json`

### designer
Reads architect + planner handoffs. Designs all user-facing output: locale strings,
CLI output specs, error message copy. Writes locale files if applicable.

**Scope constraint:** The designer does NOT do research. All inputs are already present in
the handoffs and KB files. Do not fetch external URLs or explore the web. Work only from
the architect's acceptance criteria, the planner's task list, and the existing locale files.
Staying in scope keeps this agent fast -- it should complete in under 10 minutes.

**Output:** `docs/log/phase-N.N/handoff-designer.json` + any locale/copy files produced.

**Builder must check designer output BEFORE writing any error codes or user-facing strings.**
The designer may have already named semantic categories (e.g. error codes, string keys)
that the builder should use rather than invent.

**Handoff schema:** `docs/log/_templates/schemas/handoff-designer.schema.json`

### builder
Reads ALL previous handoffs. Implements the code.

**Before writing any line of code:**
1. Read `docs/kb/requirements.md` in full.
2. Read any locale/copy files written by the designer (if applicable) to discover existing error codes and string categories.
3. Read every ADR in `docs/log/phase-N.N/`.
4. Check the planner's `openQuestions` field in `handoff-planner.json` -- resolve each one explicitly in `openQuestionsResolution`.

**After implementing:** Run `npm run build`, `npm run typecheck`, `npm run lint`, `npm run test`.
All must pass before writing the handoff.

**Output:** `docs/log/phase-N.N/handoff-builder.json`

**Handoff schema:** `docs/log/_templates/schemas/handoff-builder.schema.json`

Note: `openQuestionsResolution` is required when the planner raised open questions.

### tester
Reads architect handoff (acceptance criteria) and builder handoff (edge cases, limitations).
Maps every AC to a test. Derives expected values from AC TEXT, not from the builder's code.

**Compliance checks (run before writing handoff -- these are required fields):**

```bash
# Each must return zero matches in src/ (excluding test files) to report false:
grep -r "@ts-ignore" src/
grep -r " as any" src/
grep -rn "require(" src/ --include="*.ts" | grep -v ".test."
# Layer violation: customize this grep for the project's layer boundaries
# (see docs/kb/requirements.md -- example: grep -r "layerA" src/layerB/)
# ESM imports: relative imports must use .js extension
grep -rn "from '\.\." src/ --include="*.ts" | grep -v "\.js'"
# Untracked temp files: tests must not leave files on disk
git status --short | grep "^??" | grep -v "node_modules" | grep -v "dist/"
```

Spot-check user-facing strings: if the project uses an i18n/localization system, verify
that user-facing strings go through it rather than being hardcoded.

`untrackedTempFilesFound`: true if `git status` shows untracked paths outside the project's
expected directories (customize per project -- typically src/, tests/, dist/, docs/, .github/).
If tests create temp files, they must clean up in `afterEach`/`afterAll`.

Report results in `complianceChecks`. If any check is `true` (violation found), document
the exact file and line in `notes`. Do NOT proceed to the validator with unresolved violations
-- either flag them to the builder for a fix, or document them as blocking in the handoff.

**Output:** `docs/log/phase-N.N/handoff-tester.json`

**Handoff schema:** `docs/log/_templates/schemas/handoff-tester.schema.json`

### quality
Scores and fixes code quality before the validator sees the code. Runs AFTER the tester,
BEFORE the validator. The validator should not have to act as a code quality reviewer.

**Job:** Score the codebase and fix everything below 9 inline. The handoff records four required dimensions (1-10); see the quality agent definition for the full scoring criteria.
If a fix requires an architectural change (can't be done inline), add it to `blockingIssues`
and the validator will pick it up.

**Dimensions:**
- `codingStandards` -- TypeScript strict mode, naming, ESM discipline, no type suppressions,
  no eslint-disable comments except where documented.
- `deadCode` -- no unused exports, no unreachable branches, no commented-out code in src/.
- `security` -- OWASP Top 10 relevant to this surface: injection risks, secrets in source,
  insecure defaults, missing auth checks, unvalidated inputs at boundaries.
- `testIntegrity` -- assertions derive from spec text (AC text), not implementation. No
  softened assertions. No deleted tests. Tests that were weakened to pass score 1.

**Rules:**
- Run `npm run test` after making any fix. If tests break, revert that fix and add it to
  `blockingIssues` with the reason.
- Do NOT rewrite working code for style preferences. Fix violations, not aesthetics.
- Do NOT add comments, docstrings, or type annotations to code you didn't touch.
- `overall` score must be >= 9 for status `completed`. If you cannot get there without
  architectural changes, document those in `blockingIssues` and still write the handoff --
  the validator will route accordingly.

**Output:** `docs/log/phase-N.N/handoff-quality.json`

**Handoff schema:** `docs/log/_templates/schemas/handoff-quality.schema.json`

### validator
Adversarial read-only check. Binary PASS or FAIL.

Reads all handoffs and source code. Verifies architecture contracts, interface specs,
data privacy rules, security events, and test integrity.

**Output:** `docs/log/phase-N.N/handoff-validator.json`

**Handoff schema:** `docs/log/_templates/schemas/handoff-validator.schema.json`

`retryCount` must be incremented from the previous validator handoff on every retry.

---

## GitHub Issues

Issues are created by the **planner** immediately after it writes its handoff, before
designer or builder run. See the planner section above for the creation format.

Issue URLs are recorded in `handoff-planner.json` `githubIssues` array.

When a phase completes (validator PASS), the orchestrator:
1. Closes each issue from `handoff-planner.json githubIssues` with a comment linking to
   `docs/log/phase-N.N/phase-summary.md`.
2. Updates the project board status to `done` using the IDs in `docs/kb/github-project.yaml`.
3. Opens the PR (`phase-N.N` -> `develop`) and writes `phase-summary.md`.

---

## Branch & PR

Each phase runs on its own branch:
- Branch name: `phase-N.N` (e.g. `phase-0.1`)
- Branched from: `develop`
- PR target: `develop`

Create the branch BEFORE starting the researcher agent.
Commit after validator PASS (before opening the PR).
PR title: `Phase N.N -- <Phase Name>`
PR body: link to `docs/log/phase-N.N/phase-summary.md`.

---

## Phase Summary

After validator PASS, write `docs/log/phase-N.N/phase-summary.md`.
Use the template at `docs/log/_templates/phase-summary.md`.

Cover: objective, what was built, test results, AC status, what worked, what failed,
deferred issues, key decisions, and dependencies for the next phase.

This file is the primary human-readable record of the phase. It feeds the next phase's
context and is linked from the PR.

---

## Using Agents and Tools

- Prefer dedicated tools (Read, Edit, Grep, Glob) over Bash equivalents.
- Use subagents for broad codebase exploration or parallelizable research -- not for directed lookups.
- Use `Explore` agent for deep multi-location searches; use Grep/Glob for targeted lookups.
- Verify memory entries before acting on them: file paths and function names may have changed.

## Agent definitions: two systems

This project ships agent definitions in two locations for two different AI tools:

| Location | Tool | Tool syntax |
|---|---|---|
| `.claude/agents/` | Claude Code (CLI / desktop) | `allowed-tools`, MCP server names |
| `.github/agents/` | GitHub Copilot workspace | `tools` array with shorthand names |

Both sets encode the same roles, workflow, and behavioural rules. When you update agent
behaviour -- adding a rule, changing a tool, updating a prompt -- **update both files**.
Do not copy-paste between them without adapting the tool syntax; the formats are not
compatible.

---

## Phase Quality Gates

Each phase requires three sequential gates before moving on:
1. **Quality review** -- no dead code, no layer violations, interface contracts respected, logging/privacy compliant, no unjustified new dependencies
2. **Deliverable validation** -- acceptance criteria verified, gaps documented
3. **Go/No-go** -- proceed only when phase objective is met and blocking failures resolved

Do not implement features from a later phase while working on an earlier one.

---

## Updating docs/kb/

- **`docs/kb/knowledge.yaml`** -- project-wide facts: status, architecture, infrastructure, decisions. YAML for machine readability.
- **`docs/kb/requirements.md`** -- constraints and non-negotiables: the only human-owned document. Update when a rule changes.
- **`docs/kb/<topic>.yaml|json|md`** -- researcher findings: one focused file per topic.

Update immediately when you discover anything non-obvious. Do not wait to be asked.

---

## Handoff schema validation

Before writing any handoff JSON file to `docs/log/phase-N/`, validate it against its schema:

Phase folders use the exact phase number from `tasks.md`: `docs/log/phase-0.1/`, `docs/log/phase-0.2/` etc.

| Handoff file | Written by | Schema |
|---|---|---|
| `handoff-researcher.json` | researcher | `docs/log/_templates/schemas/handoff-researcher.schema.json` |
| `handoff-architect.json` | architect | `docs/log/_templates/schemas/handoff-architect.schema.json` |
| `handoff-planner.json` | planner | `docs/log/_templates/schemas/handoff-planner.schema.json` |
| `handoff-designer.json` | designer | `docs/log/_templates/schemas/handoff-designer.schema.json` |
| `handoff-builder.json` | builder | `docs/log/_templates/schemas/handoff-builder.schema.json` |
| `handoff-tester.json` | tester | `docs/log/_templates/schemas/handoff-tester.schema.json` |
| `handoff-quality.json` | quality | `docs/log/_templates/schemas/handoff-quality.schema.json` |
| `handoff-validator.json` | validator | `docs/log/_templates/schemas/handoff-validator.schema.json` |

On rearchitect loops (`[~]`): rename existing `handoff-architect.json` to `handoff-architect.v1.json` (incrementing) before writing the new version.

Rules:
- All `required` fields must be present and non-empty.
- Enum fields (`status`, `verdict`, `change`, `severity`, etc.) must use only the listed values.
- `id` fields in `acceptanceCriteria` and `acceptanceCriteriaStatus` must follow the `AC-N` pattern.
- `retryCount` must be incremented from the previous validator handoff -- never reset to 0 on retry.
- A handoff with missing required fields is invalid and must not be written. Fix the output first.
