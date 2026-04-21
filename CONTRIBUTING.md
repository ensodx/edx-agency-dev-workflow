# Contributing to [project-name]

Thank you for your interest in contributing. This guide covers everything you need to submit a good pull request.

## Before You Start

- Check [open issues](https://github.com/[owner]/[repo]/issues) to avoid duplicate work.
- For significant features or architectural changes, open an issue first to discuss the approach.
- This project follows a phased implementation plan. Contributions that implement future-phase features ahead of schedule will be deferred. Check `tasks.md` for the current phase.

## Branch Model

```
main        <- production releases (updated manually by maintainers)
develop     <- integration branch (all PRs target this)
  +-- feature/your-feature-name
  +-- fix/issue-description
```

Create your branch from `develop`. PRs must target `develop`.

## Development Setup

```bash
git clone https://github.com/[owner]/[repo].git
cd [repo]
git checkout develop
npm install

cp .env.example .env
# fill in your local configuration

npm run dev
```

## Code Standards

The authoritative rules are in `docs/kb/requirements.md`. Summary:

### TypeScript

- **Strict mode** -- `tsconfig.json` enforces `strict: true`. No `@ts-ignore`, no `as any`.
- **JSDoc** -- Every public function and interface must have a JSDoc comment.
- **Zod at boundaries only** -- Use Zod for config and API validation only, not for internal type assertions.

### Architecture

This project uses a layered architecture. **Layer violations are a blocking defect.**

- Requests flow strictly top-down through layers.
- See `docs/kb/knowledge.yaml` for the layer definitions.

### Logging

- Use the project's pino logger -- never `console.log`.
- No sensitive data in logs at any level.
- Every log entry during a request must include `requestId`.

### Error Handling

- Use the `AppErrorCode` enum for all errors. No ad hoc error strings.

### Accessibility

- CLI output: color must never be the only way to convey information (WCAG 1.4.1).
- If adding a web UI: WCAG 2.1 AA minimum, ARIA labels on all interactive elements, keyboard navigable.

## Testing

Run the full suite before opening a PR:

```bash
npm run typecheck
npm test
```

A failing test is a valid outcome when it accurately documents a gap. Do not weaken assertions or delete tests to achieve green CI.

| Test category | Blocking? |
|---|---|
| Contract tests (schema, config validation) | Yes |
| Integration tests | Yes |
| Edge case tests | No -- document in PR description |
| Performance tests | No until Phase 0.9 |

## Pull Request Checklist

Before submitting, verify:

- [ ] Code follows the layered architecture (no layer bypasses)
- [ ] TypeScript strict mode passes (`npm run typecheck`) without suppression comments
- [ ] Every new public function/interface has a JSDoc comment
- [ ] No sensitive data in logs at any level
- [ ] All new errors use `AppErrorCode`
- [ ] Config schema changes are backward-compatible
- [ ] `npm run build` passes
- [ ] `npm test` passes (or failures are documented with severity in the PR)

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Be respectful.

## License

By contributing, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).
