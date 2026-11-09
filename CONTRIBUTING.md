# Contributing to BoltClaw

Thanks for taking a look. BoltClaw is a small, focused security tool and
contributions are welcome - especially new scanner patterns and honest
false-positive reports.

## Before you start

- **Security issues do not go in the issue tracker as bug reports.** See
  [SECURITY.md](SECURITY.md) for how to report them.
- For anything larger than a bug fix, open an issue first so we can agree
  the shape before you write code.

## Setup

```bash
git clone https://github.com/craigmccart/BoltClaw
cd BoltClaw
npm install
npm run build
npm run test:unit
```

Node 22 or newer is required. Docker is only needed for the Playwright
end-to-end tests and the agent container.

## The gates

These must pass before a PR can merge. CI runs the first two on every pull
request.

```bash
npm run build        # builds all four packages
npm run test:unit    # unit tests, no containers needed
npm test             # Playwright end-to-end tests, needs `npm run docker:up` first
```

## Adding a scanner pattern

This is the most useful contribution.

1. **Add the pattern** in `packages/skill-scanner/`. Each pattern belongs to
   one of the six categories: exfiltration, injection, obfuscation,
   permissions, filesystem, execution.
2. **Add a unit test** in `packages/skill-scanner/src/analyzer.test.ts`
   showing the pattern fires on the thing it should catch.
3. **Check the benign case.** A pattern that fires on normal skill or MCP
   server code is worse than no pattern. Add a test proving it stays quiet
   on legitimate code that looks similar.
4. **Write the "Why this matters" text.** Every finding needs a
   plain-English explanation aimed at someone who is not a security expert.

## Design constraints

These come from the project's security principles and are not up for
negotiation in a PR:

- BoltClaw must never need more permissions than the agent it is securing.
- All config changes must be reversible. Writes go through the config
  engine, which backs up first.
- Defaults are the most restrictive setting. Users opt in to more access.
- Every security toggle needs a plain-English explanation, a risk level,
  and a note on what breaks if it is disabled.
- No cloud dependencies for core functionality.

## Pull requests

Small PRs get reviewed quickly. Large PRs that touch several unrelated
things will be sent back for splitting. Add a line to
[CHANGELOG.md](CHANGELOG.md) for anything a user would notice.

By contributing you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
