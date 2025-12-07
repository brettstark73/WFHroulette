# Issue: Dev dependency audit noise from Lighthouse/@lhci/cli

## Summary

`npm audit --audit-level high` reports 9 vulnerabilities (8 low, 1 moderate) from dev-only dependencies pulled in by `@lhci/cli`/`lighthouse` (transitive `cookie`, `js-yaml`, `tmp`, `inquirer`, `external-editor`). Runtime remains dependency-free.

## Impact

- Affects development/CI tooling only (Lighthouse CI).
- No production/runtime risk for CLI or web app.

## Suggested Actions

1. Try `npm audit fix` (non-force) to pick up patched transitive versions if available.
2. If noise persists, pin newer `@lhci/cli`/`lighthouse` or temporarily skip audit in CI for dev-only deps.
3. Avoid `npm audit fix --force` unless ready for breaking change (`@lhci/cli` would be downgraded to 0.1.0).
4. Document decision in README/AGENTS once resolved.

## References

- `npm run security:audit` output on current main
- devDependency sources: `@lhci/cli`, `lighthouse`, `@lhci/utils`, `@sentry/node`
