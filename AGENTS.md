# Repository Guidelines

Practical notes for contributing to WFHroulette. Keep changes small, deterministic, and testable.

## AI Prompt Source

- `CLAUDE.md` is the canonical assistant prompt for the project. Update that file first when changing AI guidance.
- Codex (and other LLMs) should read `CLAUDE.md` in addition to this file to stay aligned with the latest instructions.

## Project Structure & Module Organization

- `src/cli.js` is the CLI entry; `src/util.js` holds all deterministic selection logic shared by CLI and web.
- `web/` contains the static UI (`index.html`, `app.js`) and a lightweight server (`server.js`).
- `reasons.json` lists the sarcastic excuses; edit here rather than hard-coding.
- `test/` holds Node-based suites (`util.test.js` for logic, `integration.test.js` for end-to-end CLI/web flow).
- Config anchors: `eslint.config.cjs`, `tsconfig.json`, `vercel.json`, and `scripts/` utilities used by automation.

## Build, Test, and Development Commands

- `npm start` runs the CLI with defaults; `npm run web` serves the web UI locally (prints URL, typically `http://localhost:4173/web/`).
- `npm test` runs unit + integration; `npm run test:unit` and `npm run test:integration` run individually. Set `SKIP_INTEGRATION_TESTS=true` to bypass browser/server tests in CI.
- `npm run lint`/`npm run lint:fix` run ESLint (JS/HTML) and Stylelint; `npm run format`/`format:check` use Prettier.
- `npm run type-check` validates JS with the TypeScript config; `npm run validate:comprehensive` and `npm run validate:all` run automation and security checks; `npm run security:audit` and `npm run security:secrets` are lightweight pre-publish guards.

## Coding Style & Naming Conventions

- JavaScript uses ES modules and 2-space indentation; prefer named exports and small pure functions in `src/util.js`.
- No dependencies by default—avoid adding packages unless necessary.
- Prettier and ESLint (with `eslint-plugin-security`) define formatting and lint rules; Stylelint covers CSS. Husky + lint-staged run the appropriate fixes on staged files.

## Testing Guidelines

- Co-locate new tests in `test/` with `*.test.js` naming. Mirror logic changes with focused unit cases and add integration coverage for CLI or web behavior changes.
- Keep tests deterministic: seed values and dates should be explicit. Use `npm test` before PRs; note if integration tests were skipped.

## Commit & Pull Request Guidelines

- Follow conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `ci:`); keep scopes concise.
- PRs should include a short summary, testing notes (commands run), and linked issues. Add screenshots or recordings for web/UI adjustments.
- Update docs when behavior shifts (README, AGENTS, or inline CLI help). Keep changesets minimal and focused.

## Security & Configuration Tips

- Target Node 20+ (Volta pins 20.11.1). Do not commit secrets; run `npm run security:secrets` and `npm run security:audit` before release.
- The web layer serves static assets—sanitize any new user input handling and avoid dynamic HTML injection without escaping.
