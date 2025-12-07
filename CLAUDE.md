# WFHroulette - Claude Code Configuration

## Project Overview

**WFHroulette** is a Node.js CLI and web application that deterministically picks one Work-From-Home day per ISO week (Mon-Fri only) with sarcastic corporate excuses. Built with vanilla JavaScript (ES modules), no external dependencies.

### Key Features

- **Deterministic selection**: Same seed + ISO week = same WFH day and excuse
- **Dual interface**: CLI tool (`wfhroulette`) and web app (`npm run web`)
- **Corporate humor**: 20 sarcastic workplace excuses in `reasons.json`
- **ISO week calculation**: Proper business week handling (Mon-Fri)
- **Zero dependencies**: Pure Node.js and vanilla JavaScript
- **Employee-specific excuses**: Optional `--employee-id` parameter for unique excuse selection

## Project Structure

```
WFHroulette/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI pipeline (Node 20.x, 22.x matrix)
│       ├── claude-code.yml     # Claude Code automation
│       └── quality.yml         # Comprehensive quality checks
├── docs/
│   ├── ARCHITECTURE.md         # System architecture and design decisions
│   ├── TESTING.md              # Testing strategy and test suite documentation
│   └── DEPLOYMENT.md           # Deployment and distribution guide
├── scripts/
│   └── smart-test-strategy.sh  # Risk-based test selection (Pro feature)
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
├── tsconfig.json               # TypeScript configuration (type-checking only)
└── README.md                   # Usage documentation
```

## Development Guidelines

### Architecture Principles

- **Shared logic**: `src/util.js` provides core functions used by both CLI and web app
- **ES modules**: All files use `import/export` syntax
- **UTC dates**: All date calculations use UTC to avoid timezone issues
- **Deterministic hashing**: Simple hash function for reproducible randomness

### Key Functions (`src/util.js`)

- `isoWeekInfo(date)` - Calculate ISO year, week number, and Monday date
- `simpleHash(value)` - Basic hash function for deterministic selection
- `pickWFHDay(seed, date)` - Select WFH day (Mon-Fri) for ISO week
- `pickReason(seed, weekInfo, reasons, employeeId?)` - Select excuse from reasons array (with optional employee-specific selection)
- `formatDay(date)` - Format date as "Weekday, YYYY-MM-DD"

### CLI Usage (`src/cli.js`)

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

**Supported Arguments:**

- `--seed <value>` - Seed for deterministic selection (default: "default")
- `--date YYYY-MM-DD` - Anchor date (default: today)
- `--employee-id <value>` - Employee ID for unique excuse selection (optional)
- `--json` - Output as JSON
- `--help` - Show usage information

**Output Formats:**

- **Text**: Human-readable output with formatted date and excuse
- **JSON**: Machine-readable output with structured data including `employeeId` field

### Web App (`web/`)

- **Server**: Simple static file server with MIME type handling
- **Frontend**: Vanilla JS with fallback reasons array
- **UI**: Clean card-based design with gradient button, includes employee ID input field
- **API**: Fetches `reasons.json`, falls back to embedded array
- **Employee-specific**: Web UI supports employee ID input for personalized excuses

## Development Commands

### Setup & Usage

```bash
npm install              # Install devDependencies and tools
npm link                 # Make CLI globally available as 'wfhroulette'
npm start               # Run CLI with default settings
npm run web             # Start web server on port 4173
```

### Testing & Validation

```bash
# Test execution
npm test                         # Run all tests (unit + integration)
npm run test:unit                # Run 12 unit tests for core logic
npm run test:integration         # Run 7 browser/server integration tests
npm run test:ci                  # CI-safe mode (skips integration if ports blocked)
npm run test:help                # Test CLI help output

# Code quality
npm run lint                     # Run ESLint and Stylelint
npm run lint:fix                 # Auto-fix linting issues
npm run format                   # Format code with Prettier
npm run format:check             # Check formatting without changes
npm run type-check               # TypeScript type checking (no emit)

# Security & validation
npm run security:audit           # Check for vulnerable dependencies (high-level)
npm run security:secrets         # Scan for hardcoded secrets
npm run security:config          # Run security config validation
npm run validate:docs            # Validate documentation
npm run validate:comprehensive   # Comprehensive validation
npm run validate:all             # All validation checks

# Performance
npm run lighthouse:ci            # Run Lighthouse CI checks
npm run lighthouse:upload        # Upload Lighthouse results
```

### Smart Test Strategy (`scripts/smart-test-strategy.sh`)

Risk-based test selection powered by `create-qa-architect Pro`:

- **Risk scoring**: Analyzes changed files, lines, branch, and time of day
- **Adaptive testing**: Runs full suite for high-risk changes, unit tests for medium, lint-only for low
- **Speed optimization**: Optimizes for speed during work hours (9am-5pm Mon-Fri)
- **Environment overrides**:
  - `SKIP_SMART=1` - Always run comprehensive tests
  - `FORCE_MINIMAL=1` - Always run lint only

**Risk factors:**

- High-risk files: `src/`, `lib/`, `cli`
- Config changes: `package.json`, `.env`, config files
- Large changesets: 10+ files or 200+ lines
- Protected branches: `main`, `master`, `production`, `hotfix/*`

## Code Style & Conventions

### Existing Patterns

- **No semicolons** (ASI style)
- **ES modules** with explicit `.js` extensions in imports
- **Consistent indentation** (2 spaces)
- **Error handling** with descriptive messages
- **UTC date handling** to avoid timezone confusion
- **Functional approach** with pure functions in util.js

### File Conventions

- **CLI args**: Support both `--flag=value` and `--flag value` syntax
- **Date input**: Always expect ISO format (`YYYY-MM-DD`)
- **JSON output**: Use `JSON.stringify()` with 2-space indentation
- **Error messages**: Descriptive and user-friendly

## Testing Strategy

### Automated Test Suite

**Comprehensive testing with 19 automated tests:**

```bash
npm test                 # Full suite (unit + integration)
npm run test:unit        # 12 unit tests for core logic
npm run test:integration # 7 browser/server integration tests
npm run test:ci          # CI-safe mode (skips integration if ports blocked)
```

### Unit Test Coverage (`test/util.test.js`)

**12 tests organized as individual functions:**

- **Hash function**: Consistency, edge cases, null/undefined handling
- **ISO week calculations**: Known dates, year boundaries, Monday alignment
- **WFH day selection**: Deterministic behavior, weekday validation (Mon-Fri)
- **Reason selection**: Deterministic picking, error handling, input validation
- **Date formatting**: Correct output, different date handling
- **Integration workflow**: End-to-end logic validation

### Integration Tests (`test/integration.test.js`)

**7 tests organized as a single function group:**

- **Server lifecycle**: Automated startup/shutdown, port binding
- **Asset loading**: Script paths, module accessibility, CSS presence
- **HTML structure**: Required DOM elements, form inputs, button text
- **HTTP responses**: Status codes, content validation, error handling
- **Security scanning**: XSS pattern detection in static content
- **File accessibility**: JavaScript modules, JSON data, utility functions

**Note:** Integration tests are structured as a single test suite that starts the server once and runs multiple validation checks, rather than separate test functions.

### CI/Sandbox Support

- **Graceful fallback**: Skips integration tests when port binding blocked
- **Environment control**: `SKIP_INTEGRATION_TESTS=true` flag
- **Error detection**: Handles EPERM/EACCES/EADDRINUSE gracefully

## CI/CD Pipeline

### GitHub Actions Workflows

**1. CI Pipeline (`.github/workflows/ci.yml`)**

Runs on: `push` and `pull_request` to `main`

- **Node.js matrix**: Tests on Node 20.x and 22.x
- **Test jobs**:
  - Unit tests (`npm run test:unit`)
  - Integration tests (`npm run test:ci`)
  - CLI functionality tests
- **Lint jobs**:
  - Syntax validation (`node --check`)
  - Security audit (`npm audit --audit-level high`)
  - Hardcoded secrets detection

**2. Quality Checks (`.github/workflows/quality.yml`)**

Runs on: `push` and `pull_request` to `main`, `master`, `develop`

- **Dependency integrity**: Package-lock verification, signature checks
- **Code quality**: Prettier, ESLint (max warnings: 0), Stylelint
- **Security**:
  - Dependency audit (high-level vulnerabilities)
  - Hardcoded secrets detection
  - XSS vulnerability pattern detection
  - Input validation checks
- **Configuration**: Security config validation
- **Documentation**: Documentation validation
- **Performance**: Lighthouse CI (if configured)

**3. Claude Code (`.github/workflows/claude-code.yml`)**

Runs on: Issue comments and PR review comments

- **AI assistance**: Automated code review and quality improvements
- **Permissions**: write access to contents, issues, and PRs

## Security & Best Practices

### Security Fixes Implemented

- **XSS vulnerability eliminated**: Replaced dangerous `innerHTML` with safe DOM construction
- **Input sanitization**: HTML escaping function for user-provided seeds
- **Attack vector closed**: Malicious inputs like `<img src=x onerror=alert(1)>` now harmless
- **Automated security testing**: Integration tests scan for XSS patterns in static content

### Current Implementation

- **Path traversal protection**: Server validates file paths within project root
- **No user input persistence**: All selections are ephemeral
- **No external dependencies**: Reduces supply chain attack surface
- **Client-side only secrets**: No server-side data storage
- **Safe DOM manipulation**: Uses `textContent` and `createElement()` instead of `innerHTML`

### Security Patterns Detected by CI/CD

- `innerHTML` with template literal interpolation
- `eval()` with interpolation
- `document.write()` with interpolation
- `onclick` handlers with interpolation
- Hardcoded secrets (passwords, keys, tokens)
- Private keys in codebase

## Deployment & Distribution

### Publishing Options

1. **npm package**: Already configured with `bin` entry for global CLI
2. **Static hosting**: Web app can be deployed to any static host (Vercel, Netlify, etc.)
3. **Local usage**: `npm link` for development/personal use

### Environment Configuration

- **Port**: Web server uses `process.env.PORT` or defaults to 4173
- **File paths**: All relative to project root, uses `__dirname` resolution
- **CORS**: Simple static file server, no special CORS handling needed

### Maintenance Notes

- **reasons.json**: Can be edited to add/remove/modify excuses
- **Hash algorithm**: Simple but sufficient for this use case
- **ISO week logic**: Follows standard ISO 8601 specification
- **Date handling**: All operations in UTC to prevent timezone bugs

## Additional Documentation

For deeper technical details, see:

- **[/docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md)** - System architecture, design decisions, and data flow
- **[/docs/TESTING.md](/docs/TESTING.md)** - Comprehensive testing strategy and test suite documentation
- **[/docs/DEPLOYMENT.md](/docs/DEPLOYMENT.md)** - Deployment guide and distribution options

## Key Principles for AI Assistants

### When Making Changes

1. **Read before writing**: Always read existing files before modifying
2. **Follow conventions**: Match existing code style and patterns
3. **Security first**: Never introduce vulnerabilities
4. **Type safety**: Ensure TypeScript types are correct (even though we don't emit)
5. **Test locally**: Verify changes work before committing
6. **Update docs**: Keep documentation in sync with code

### What NOT to Do

- Don't introduce external dependencies (zero-dependency design)
- Don't use semicolons (ASI style)
- Don't use `innerHTML` or other XSS-prone patterns
- Don't skip file extension in imports (must use `.js`)
- Don't bypass security checks or linting rules
- Don't commit code that fails tests

### Code Review Checklist

- [ ] All imports include `.js` extension
- [ ] No `innerHTML` or dangerous DOM manipulation
- [ ] UTC date handling maintained
- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Documentation updated if needed
- [ ] Security patterns avoided

---

_This project demonstrates clean separation between CLI and web interfaces sharing common business logic, with deterministic behavior ideal for team coordination._

> **Vibe Build Lab LLC** - [vibebuildlab.com](https://vibebuildlab.com)
