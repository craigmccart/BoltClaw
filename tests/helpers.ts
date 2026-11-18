/**
 * Shared helpers for the end-to-end tests.
 *
 * BoltClaw's API needs a token. Start the server with BOLTCLAW_API_TOKEN set
 * and run the tests with the same value in the environment, for example:
 *
 *   BOLTCLAW_API_TOKEN=e2e-local-token npm run docker:up
 *   BOLTCLAW_API_TOKEN=e2e-local-token npm test
 */
export const API_TOKEN = process.env.BOLTCLAW_API_TOKEN ?? "";

if (!API_TOKEN) {
  throw new Error(
    "BOLTCLAW_API_TOKEN is not set. Start BoltClaw with BOLTCLAW_API_TOKEN=<value> " +
      "and run the tests with the same value so they can authenticate.",
  );
}

/** The authenticated dashboard URL, the same shape BoltClaw prints at startup. */
export const APP_URL = `/?token=${encodeURIComponent(API_TOKEN)}`;
