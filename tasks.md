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

## Template setup -- complete these before starting your first phase

- [ ] Fork or copy this repository
- [ ] `package.json` -- update `name`, `description`, `repository`, `bugs`
- [ ] `README.md` -- update project name, description, quick start
- [ ] `CONTRIBUTING.md` -- replace `[owner]/[repo]` placeholders with your GitHub repo
- [ ] `docs/kb/requirements.md` -- replace example constraints with your project's rules
- [ ] `docs/kb/knowledge.yaml` -- clear example content below `index:`; fill in project name and phase
- [ ] `docs/kb/github-project.yaml` -- replace `TODO` values with your GitHub Projects V2 IDs
- [ ] `tasks.md` -- replace this section with your Phase 0.1 tasks
- [ ] Delete `src/` -- the hello world is a reference only; implement your own

