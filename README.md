# WFHroulette 🎲

Randomly (but deterministically) pick one Work-From-Home day per ISO week (Mon–Fri only) and get a sarcastic excuse.

## Why deterministic?

Teams love a bit of chaos, but calendars do not. A deterministic pick lets everyone use the same seed (team name, project, whatever) and get the exact same WFH day and excuse for that ISO week. No more arguing over who "won"—if the hash says Thursday, you grab your sweatpants and roll with it.

## Install & Run (CLI)

```bash
npm install
npm link
wfhroulette --seed my-team --date 2025-09-25
```

**Options**

- `--seed <value>`: Team, project, or inside joke to feed the hash. Defaults to `default`.
- `--date YYYY-MM-DD`: Anchor date for the ISO week. Defaults to today.
- `--json`: Emit machine-readable JSON instead of text.
- `--help`: Show usage information.

## Web App usage

```bash
npm run web
```

Then open the printed URL (usually <http://localhost:3000/web/>). Enter your seed and optional date, hit **Pick**, and bask in your sanctioned remote day and excuse.

## Testing

**Run all tests:**
```bash
npm test                 # Unit + integration tests
```

**Run specific test suites:**
```bash
npm run test:unit        # Core logic tests only
npm run test:integration # Browser/server tests only
npm run test:ci          # CI-safe mode (skips integration if ports blocked)
```

**Test coverage includes:**
- Deterministic hashing and date calculations
- ISO week handling and edge cases
- Web server integration and asset loading
- XSS vulnerability detection
- HTML structure and DOM validation

## Config/Extending

- Add or tweak excuses in [`reasons.json`](./reasons.json).
- Drop in your own deterministic logic by editing [`src/util.js`](./src/util.js). Both the CLI and the web app share these helpers, so everything stays in sync.
- Want to ship it? Publish to npm or toss it behind a static host—`npm link` just wires it up locally.

## Sample Output

```text
WFH Day for seed "my-team" (ISO week 2025-W39)
  Thursday, 2025-09-25
Excuse: My ergonomic chair was reassigned to a visiting consultant's emotional support cactus.
```

## License

MIT © Brett Stark
