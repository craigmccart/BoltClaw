# Security

## Reporting vulnerabilities

If you find a security issue in BoltClaw, please open a GitHub issue or email craig.mccart@outlook.com. BoltClaw is a portfolio project maintained by one person, so there is no bug bounty, but all reports will be acknowledged and addressed.

## Dependency hygiene policy

BoltClaw runs `npm audit` before every release. The policy is:

1. **Runtime dependencies** (anything that ships in the built dashboard or MCP server) must have zero known high or critical vulnerabilities at release time. If a patched version exists, we upgrade. If no patch exists, we document the finding below and assess whether BoltClaw's usage is affected.
2. **Dev dependencies** (build tools, test runners, linters) are lower priority. If a vulnerability only exists in a package used during development and never runs in production, it may be deferred until the upstream maintainer ships a fix. These are documented below with a reason for deferral.
3. **Overrides** are used sparingly. If a transitive dependency has a patched version but the direct dependency hasn't updated yet, we pin via `overrides` in `package.json` only when we've confirmed the patched version doesn't introduce breaking changes.

## Current status

Last audited: 2026-11-10

### Resolved in this audit

`npm audit` reported 20 findings (1 critical, 12 high, 5 moderate, 2 low) after several months without dependency updates. 19 were resolved with non-breaking minor and patch bumps, first through a grouped Dependabot update and then `npm audit fix`.

### Deferred findings

1 low severity finding in **esbuild** ([GHSA-g7r4-m6w7-qqqr](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr)), pulled in by the build tools tsup and Vite. It affects esbuild's development server on Windows. esbuild is a dev-only build dependency and is never included in the production dashboard or MCP server builds. Deferred until tsup and Vite pick up a patched esbuild.

### Runtime dependency status

Zero known vulnerabilities in runtime dependencies as of last audit date (`npm audit --omit=dev`). Runtime deps include: Express 5.3.0, Helmet 8.3.0, Multer 2.5.0, Zod 4.6.7, dotenv, @modelcontextprotocol/sdk.

Dependabot now opens weekly update PRs, and CodeQL scans every push and pull request.

## Hardening measures

BoltClaw applies the following security measures to its own codebase:

- **API authentication** - shared-secret token required for all API endpoints except health check, with constant-time comparison
- **Input validation** - Zod schemas on all API request bodies
- **Path traversal prevention** - scan paths validated against a configurable root directory, sensitive paths explicitly blocked
- **Rate limiting** - per-client request limit on the whole server (600 requests a minute by default, override with `BOLTCLAW_RATE_LIMIT`), plus a concurrent scan limit to prevent resource exhaustion
- **No symlink following** - the scanner skips symbolic links, so a skill cannot point the scanner at files outside its own directory
- **CSP headers** - Helmet with a restrictive Content Security Policy
- **Automatic backups** - every config write creates a timestamped backup
- **Audit logging** - all config reads, writes, restores, and scans are logged with timestamps
