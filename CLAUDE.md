# WFHroulette - Claude Code Configuration

## Project Overview

**WFHroulette** is a Node.js CLI and web app that deterministically picks one Work-From-Home day per ISO week (Mon-Fri only) with sarcastic corporate excuses. Built with vanilla JavaScript (ES modules), zero external dependencies.

### Key Features

- **Deterministic selection**: Same seed + ISO week = same WFH day and excuse
- **Dual interface**: CLI tool (`wfhroulette`) and web app (`npm run web`)
- **Corporate humor**: 20 sarcastic workplace excuses in `reasons.json`
- **Employee-specific excuses**: Optional `--employee-id` parameter for unique excuse selection
- **Zero dependencies**: Pure Node.js and vanilla JavaScript

## Tech Stack

- **Runtime**: Node.js 20.x+ (ES modules)
- **Testing**: Custom test harness (19 tests: 12 unit, 7 integration)
- **Quality**: ESLint, Prettier, Stylelint, TypeScript (type-checking only)
- **Security**: XSS prevention, input sanitization, secret detection

## Project Structure

```
WFHroulette/
├── src/
│   ├── cli.js                  # CLI entry point with argument parsing
│   └── util.js                 # Core logic: ISO week calculation, hashing, selection
├── web/
│   ├── server.js               # Static file server (port 4173)
│   ├── index.html              # Single-page web UI
│   └── app.js                  # Frontend JavaScript (imports from src/util.js)
├── test/
│   ├── util.test.js            # Unit tests (12 tests)
│   ├── integration.test.js     # Integration tests (7 tests)
│   └── test-runner.js          # Custom test harness
├── reasons.json                # Array of sarcastic WFH excuses
├── package.json                # Node.js config, ES modules, bin entry
└── tsconfig.json               # TypeScript configuration (type-checking only)
```

## Usage

### CLI

```bash
# Basic usage
wfhroulette --seed my-team --date 2025-09-25

# With employee-specific excuse
wfhroulette --seed my-team --date 2025-09-25 --employee-id john.doe

# JSON output
wfhroulette --seed my-team --date 2025-09-25 --employee-id john.doe --json

# Help
wfhroulette --help
```

**Arguments:**

- `--seed <value>` - Seed for deterministic selection (default: "default")
- `--date YYYY-MM-DD` - Anchor date (default: today)
- `--employee-id <value>` - Employee ID for unique excuse selection (optional)
- `--json` - Output as JSON
- `--help` - Show usage information

### Programmatic

```javascript
import { pickWFHDay, pickReason, isoWeekInfo } from './src/util.js'
import reasons from './reasons.json' with { type: 'json' }

const date = new Date('2025-09-25')
const seed = 'my-team'
const employeeId = 'john.doe'

const wfhDate = pickWFHDay(seed, date)
const weekInfo = isoWeekInfo(date)
const excuse = pickReason(seed, weekInfo, reasons, employeeId)

console.log(`WFH Day: ${wfhDate.toISOString().split('T')[0]}`)
console.log(`Excuse: ${excuse}`)
```

## Key Commands

### Setup & Usage

```bash
npm install              # Install devDependencies and tools
npm link                 # Make CLI globally available as 'wfhroulette'
npm start               # Run CLI with default settings
npm run web             # Start web server on port 4173
```

### Testing & Quality

```bash
# Testing
npm test                         # Run all tests (unit + integration)
npm run test:unit                # Run 12 unit tests for core logic
npm run test:integration         # Run 7 browser/server integration tests
npm run test:ci                  # CI-safe mode (skips integration if ports blocked)

# Code quality
npm run lint                     # Run ESLint and Stylelint
npm run lint:fix                 # Auto-fix linting issues
npm run format                   # Format code with Prettier
npm run format:check             # Check formatting without changes
npm run type-check               # TypeScript type checking (no emit)

# Security
npm run security:audit           # Check for vulnerable dependencies (high-level)
npm run security:secrets         # Scan for hardcoded secrets
npm run validate:all             # All validation checks
```

## Code Conventions

### Existing Patterns

- **No semicolons** (ASI style)
- **ES modules** with explicit `.js` extensions in imports
- **UTC date handling** to avoid timezone confusion
- **Functional approach** with pure functions in util.js
- **Safe DOM manipulation**: Uses `textContent` and `createElement()` instead of `innerHTML`

### Core Functions (`src/util.js`)

- `isoWeekInfo(date)` - Calculate ISO year, week number, and Monday date
- `simpleHash(value)` - Basic hash function for deterministic selection
- `pickWFHDay(seed, date)` - Select WFH day (Mon-Fri) for ISO week
- `pickReason(seed, weekInfo, reasons, employeeId?)` - Select excuse from reasons array
- `formatDay(date)` - Format date as "Weekday, YYYY-MM-DD"

## What NOT to Do

### Security & Code Quality

- Don't introduce external dependencies (zero-dependency design)
- Don't use semicolons (ASI style)
- Don't use `innerHTML` or other XSS-prone patterns
- Don't skip file extension in imports (must use `.js`)
- Don't bypass security checks or linting rules
- Don't commit code that fails tests

### Architecture

- Don't modify core deterministic logic without updating tests
- Don't change ISO week calculation (follows ISO 8601 spec)
- Don't mix timezones (all date operations use UTC)
- Don't add server-side persistence (client-side only design)

## Key Principles for AI Assistants

### When Making Changes

1. **Read before writing**: Always read existing files before modifying
2. **Follow conventions**: Match existing code style (no semicolons, ES modules)
3. **Security first**: Never introduce XSS or other vulnerabilities
4. **Test locally**: Verify changes work before committing
5. **Update docs**: Keep documentation in sync with code

### Code Review Checklist

- [ ] All imports include `.js` extension
- [ ] No `innerHTML` or dangerous DOM manipulation
- [ ] UTC date handling maintained
- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] No external dependencies added
- [ ] Security patterns avoided

## Additional Documentation

For deeper technical details, see:

- **[/docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md)** - System architecture and design decisions
- **[/docs/TESTING.md](/docs/TESTING.md)** - Comprehensive testing strategy
- **[/docs/DEPLOYMENT.md](/docs/DEPLOYMENT.md)** - Deployment guide and distribution options

---

_Deterministic WFH day picker with corporate humor - ideal for team coordination._

> **Vibe Build Lab LLC** - [vibebuildlab.com](https://vibebuildlab.com)
