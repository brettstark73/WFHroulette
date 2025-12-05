# WFHroulette - Claude Code Configuration

## Project Overview

**WFHroulette** is a Node.js CLI and web application that deterministically picks one Work-From-Home day per ISO week (Mon-Fri only) with sarcastic corporate excuses. Built with vanilla JavaScript (ES modules), no external dependencies.

### Key Features

- **Deterministic selection**: Same seed + ISO week = same WFH day and excuse
- **Dual interface**: CLI tool (`wfhroulette`) and web app (`npm run web`)
- **Corporate humor**: 20 sarcastic workplace excuses in `reasons.json`
- **ISO week calculation**: Proper business week handling (Mon-Fri)
- **Zero dependencies**: Pure Node.js and vanilla JavaScript

## Project Structure

```
WFHroulette/
├── src/
│   ├── cli.js          # CLI entry point with argument parsing
│   └── util.js         # Core logic: ISO week calculation, hashing, selection
├── web/
│   ├── server.js       # Static file server (port 4173)
│   ├── index.html      # Single-page web UI
│   └── app.js          # Frontend JavaScript (imports from src/util.js)
├── reasons.json        # Array of sarcastic WFH excuses
├── package.json        # Node.js config, ES modules, bin entry
└── README.md          # Usage documentation
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
- `pickReason(seed, weekInfo, reasons)` - Select excuse from reasons array
- `formatDay(date)` - Format date as "Weekday, YYYY-MM-DD"

### CLI Usage (`src/cli.js`)

```bash
wfhroulette --seed my-team --date 2025-09-25 --json
```

- Argument parsing with `--seed`, `--date`, `--json`, `--help` flags
- Loads `reasons.json` for excuse selection
- Outputs formatted text or JSON

### Web App (`web/`)

- **Server**: Simple static file server with MIME type handling
- **Frontend**: Vanilla JS with fallback reasons array
- **UI**: Clean card-based design with gradient button
- **API**: Fetches `reasons.json`, falls back to embedded array

## Development Commands

### Setup & Usage

```bash
npm install              # Install (no dependencies, but sets up package)
npm link                 # Make CLI globally available as 'wfhroulette'
npm start               # Run CLI with default settings
npm run web             # Start web server on port 4173
npm test                # Run all tests (unit + integration)
```

### Testing & Validation

- **Manual CLI testing**: `wfhroulette --help`, various seed/date combinations
- **Web testing**: Check `http://localhost:4173/web/` functionality
- **Date edge cases**: Test ISO week boundaries (Dec/Jan transitions)
- **Determinism**: Verify same seed+date always produces same result

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

## Deployment & Distribution

### Publishing Options

1. **npm package**: Already configured with `bin` entry for global CLI
2. **Static hosting**: Web app can be deployed to any static host
3. **Local usage**: `npm link` for development/personal use

### Environment Configuration

- **Port**: Web server uses `process.env.PORT` or defaults to 4173
- **File paths**: All relative to project root, uses `__dirname` resolution
- **CORS**: Simple static file server, no special CORS handling needed

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

- **Hash function**: Consistency, edge cases, null/undefined handling
- **ISO week calculations**: Known dates, year boundaries, Monday alignment
- **WFH day selection**: Deterministic behavior, weekday validation (Mon-Fri)
- **Reason selection**: Deterministic picking, error handling, input validation
- **Date formatting**: Correct output, different date handling
- **Integration workflow**: End-to-end logic validation

### Browser Integration Tests (`test/integration.test.js`)

- **Server startup/shutdown**: Automated lifecycle management
- **Asset loading**: Script paths, module accessibility, CSS presence
- **HTML structure**: Required DOM elements, form inputs, button text
- **HTTP responses**: Status codes, content validation, error handling
- **Security scanning**: XSS pattern detection in static content
- **File accessibility**: JavaScript modules, JSON data, utility functions

### CI/Sandbox Support

- **Graceful fallback**: Skips integration tests when port binding blocked
- **Environment control**: `SKIP_INTEGRATION_TESTS=true` flag
- **Error detection**: Handles EPERM/EACCES/EADDRINUSE gracefully

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

### Maintenance Notes

- **reasons.json**: Can be edited to add/remove/modify excuses
- **Hash algorithm**: Simple but sufficient for this use case
- **ISO week logic**: Follows standard ISO 8601 specification
- **Date handling**: All operations in UTC to prevent timezone bugs

---

_This project demonstrates clean separation between CLI and web interfaces sharing common business logic, with deterministic behavior ideal for team coordination._
