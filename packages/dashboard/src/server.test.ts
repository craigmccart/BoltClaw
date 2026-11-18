import { test } from "node:test";
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";

// SCAN_ROOT is resolved at module load from BOLTCLAW_SCAN_ROOT.
// Set it to a known temp dir before importing validation so the
// "valid path inside SCAN_ROOT" case has something real to hit.
process.env.BOLTCLAW_SCAN_ROOT = tmpdir();

// Importing server.ts triggers its top-level token resolution (random bytes +
// homedir write). Short-circuit that with an env token so tests never touch
// a real ~/.openclaw/ tree.
process.env.BOLTCLAW_API_TOKEN = "test-token-buildCloneArgs-only";

const { ScanRequestSchema } = await import("./validation.js");

test("ScanRequestSchema rejects relative traversal like ../../../etc/passwd", () => {
  const result = ScanRequestSchema.safeParse({ path: "../../../etc/passwd" });
  assert.equal(result.success, false);
});

test("ScanRequestSchema rejects ~/.ssh/id_rsa after home expansion", () => {
  const result = ScanRequestSchema.safeParse({ path: "~/.ssh/id_rsa" });
  assert.equal(result.success, false);
});

test("ScanRequestSchema accepts a GitHub URL", () => {
  const result = ScanRequestSchema.safeParse({
    path: "https://github.com/openclaw/example",
  });
  assert.equal(result.success, true);
});

test("ScanRequestSchema accepts a valid path inside SCAN_ROOT", () => {
  const result = ScanRequestSchema.safeParse({
    path: join(tmpdir(), "my-skill"),
  });
  assert.equal(result.success, true);
});

// --- GitHub clone safety flags ---
//
// buildCloneArgs is imported from server.ts rather than shelling out, so these
// tests run offline and assert the exact flags we send to git. If any safety
// flag is dropped, these tests fail.

const { buildCloneArgs, CLONE_MAX_BYTES, CLONE_MAX_FILES } = await import("./server.js");

test("buildCloneArgs uses shallow, single-branch, no-tags clone", () => {
  const args = buildCloneArgs("owner/repo", "main", "/tmp/x");
  assert.ok(args.includes("--depth"), "--depth flag missing");
  assert.equal(args[args.indexOf("--depth") + 1], "1");
  assert.ok(args.includes("--single-branch"), "--single-branch flag missing");
  assert.ok(args.includes("--no-tags"), "--no-tags flag missing");
});

test("buildCloneArgs applies server-side blob size filter", () => {
  const args = buildCloneArgs("owner/repo", "main", "/tmp/x");
  assert.ok(args.includes("--filter=blob:limit=10m"), "blob size filter missing");
});

test("buildCloneArgs disables redirect following", () => {
  const args = buildCloneArgs("owner/repo", "main", "/tmp/x");
  const httpRedirectIdx = args.indexOf("http.followRedirects=false");
  assert.notEqual(httpRedirectIdx, -1, "http.followRedirects=false not set");
  // -c must come immediately before the config key
  assert.equal(args[httpRedirectIdx - 1], "-c");
});

test("buildCloneArgs pins the requested branch and repo URL", () => {
  const args = buildCloneArgs("owner/repo", "feature-x", "/tmp/x");
  assert.ok(args.includes("--branch"), "--branch flag missing");
  assert.equal(args[args.indexOf("--branch") + 1], "feature-x");
  assert.ok(args.includes("https://github.com/owner/repo.git"), "repo URL missing");
  assert.equal(args[args.length - 1], "/tmp/x", "target dir must be last arg");
});

test("CLONE_MAX_BYTES and CLONE_MAX_FILES are set to 50 MB and 10k", () => {
  assert.equal(CLONE_MAX_BYTES, 50 * 1024 * 1024);
  assert.equal(CLONE_MAX_FILES, 10_000);
});

// ─── Token exposure ───────────────────────────────────────────────────────────
// The API token must never be readable without already having it. An earlier
// version embedded it in the HTML served by the unauthenticated SPA fallback
// route, so any request to a non-root path could read it.

const { app } = await import("./server.js");

async function withServer(fn: (base: string) => Promise<void>): Promise<void> {
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

test("unauthenticated pages never contain the API token", async () => {
  const token = process.env.BOLTCLAW_API_TOKEN!;
  await withServer(async (base) => {
    for (const path of ["/", "/anything", "/deep/link/page", "/index.html"]) {
      const res = await fetch(base + path);
      const body = await res.text();
      assert.ok(!body.includes(token), `${path} leaked the API token`);
      assert.ok(!body.includes("__BOLTCLAW_TOKEN__="), `${path} still injects a token script`);
    }
  });
});

test("API rejects requests without a token and accepts the right one", async () => {
  const token = process.env.BOLTCLAW_API_TOKEN!;
  await withServer(async (base) => {
    const anonymous = await fetch(`${base}/api/profiles`);
    assert.equal(anonymous.status, 401);

    const wrong = await fetch(`${base}/api/profiles`, { headers: { "x-boltclaw-token": "nope" } });
    assert.equal(wrong.status, 401);

    const ok = await fetch(`${base}/api/profiles`, { headers: { "x-boltclaw-token": token } });
    assert.equal(ok.status, 200);

    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 200);
  });
});
