## What this changes

<!-- One or two sentences. Link the issue if there is one. -->

## Why

<!-- What problem does this solve? For a new scanner pattern: what threat does it catch? -->

## Checklist

- [ ] `npm run build` passes
- [ ] `npm run test:unit` passes
- [ ] Added an entry to `CHANGELOG.md`
- [ ] No real API keys, tokens or credentials in code or fixtures

### If this adds or changes a scanner pattern

- [ ] Added a unit test in `packages/skill-scanner/src/analyzer.test.ts`
- [ ] Checked it does not fire on legitimate skill or MCP server code
- [ ] Wrote a plain-English "Why this matters" explanation for the finding

### If this adds or changes a security toggle

- [ ] The toggle has a plain-English explanation, a risk level, and says what breaks if disabled
- [ ] The default is the most restrictive setting
