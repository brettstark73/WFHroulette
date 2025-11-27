# Repository Guidelines

## Pre-Action Checklist

Before suggesting ANY infrastructure, CI/CD, or tooling changes:
1. Run `ls .github/workflows/` to see existing workflows
2. Run `cat package.json | grep scripts -A 50` to see available commands
3. Check for `.qualityrc.json`, `CLAUDE.md`, or similar config files

## Project Structure & Module Organization

- `src/` holds shared logic: `cli.js` is the entry point, `util.js` exposes deterministic hashing, ISO-week math, and formatting reused everywhere.
- `web/` contains the browser app (`index.html`, `app.js`) plus the static server (`server.js`, defaults to port 4173).
- `test/` includes the dependency-free runners: `util.test.js` for units and `integration.test.js` for web smoke checks.
- Key configs: `package.json` (scripts, bin metadata), `vercel.json` (hosting rewrites), and `reasons.json` (excuse catalog). Document changes here in PR notes.

## Build, Test, and Development Commands

- `npm start` runs the CLI for quick seed/date sanity checks; `npm run web` serves the UI at `http://localhost:4173/web/`.
- `npm test` runs unit + integration suites and auto-skips the browser checks if port binding fails.
- `npm run test:unit` isolates the core logic; `npm run test:integration` forces the browser smoke; `npm run test:ci` pairs the unit suite with `SKIP_INTEGRATION_TESTS=true` for locked-down CI.

## Coding Style & Naming Conventions

- Use ES modules with explicit `.js` extensions, two-space indentation, trailing semicolons, and double-quoted strings.
- Adopt `camelCase` for variables/functions and `UPPER_SNAKE_CASE` for shared constants. Keep helpers pure and parameter-driven.
- On the web surface, prefer `textContent` and the existing escape helper over raw `innerHTML` to preserve the XSS mitigation.

## Testing Guidelines

- Expand `test/util.test.js` alongside new logic; cover deterministic expectations and edge dates.
- The integration runner boots `web/server.js` on an alternate port and fetches `/web/app.js`, `/src/util.js`, and `/reasons.json`. Update those checks if paths change.
- Use `SKIP_INTEGRATION_TESTS=true` only when sockets are unavailable; otherwise keep the smoke tests active so asset regressions surface.
- Maintain deterministic fixtures—adjusting `reasons.json` should keep the array stable so CLI and web output stay aligned.

## Commit & Pull Request Guidelines

- Write imperative subjects (recent examples: “Prevent XSS in seed input”, “Add browser integration tests”). Split CLI, web, and infra changes when they can ship separately.
- PRs should enumerate testing (`npm test`, `npm run test:ci`, manual web checks), include CLI snippets or UI screenshots when behavior changes, and note Vercel/config tweaks.

## Deployment & Configuration Tips

- Vercel rewrites `/` to `/web/index.html`; ensure new shared modules remain reachable (the integration tests will flag missing assets).
- The static server enforces path normalization—store new assets inside the repo root to keep that guard working.
- For protected preview deployments, confirm unauthenticated visitors actually load `/web/app.js` and `/src/util.js`; without them the button appears dead despite HTML rendering.

## Quality Automation (create-quality-automation)

**IMPORTANT**: This project uses `create-quality-automation` for CI/CD quality gates. Before suggesting or creating ANY new GitHub Actions workflows for lint/test/security/formatting, you MUST first check:

1. `.github/workflows/quality.yml` — already exists and handles all quality checks

**DO NOT** create duplicate workflows. The existing workflow already handles:
- ESLint with security rules
- Prettier formatting checks
- Test execution
- Security audit (`npm audit`)

**Available Commands** (use these instead of suggesting new workflows):
- `npm test` — Run all tests
- `npm run test:unit` — Unit tests only
- `npm run test:ci` — CI-optimized test run

**Before proposing CI/CD changes**: Run `ls .github/workflows/` and `cat .github/workflows/quality.yml` to understand what already exists.
