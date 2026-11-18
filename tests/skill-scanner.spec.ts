import { test, expect } from "@playwright/test";
import { APP_URL } from "./helpers.js";

test.describe("Skill Scanner", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
    await page.locator("nav").getByText("Skill Scanner").click();
  });

  test("shows scanner input and scan button", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Skill Scanner" })).toBeVisible();
    await expect(page.locator("input[type='text']")).toBeVisible();
    await expect(page.getByRole("button", { name: "Scan", exact: true })).toBeVisible();
  });

  test("shows error for non-existent path", async ({ page }) => {
    // Must be inside the allowed scan folder (default ~/.claude/skills),
    // otherwise the path is rejected before existence is checked.
    await page.locator("input[type='text']").fill("~/.claude/skills/boltclaw-e2e-does-not-exist");
    await page.getByRole("button", { name: "Scan", exact: true }).click();
    // Wait for the error banner to appear
    await expect(page.locator("text=Path does not exist")).toBeVisible({ timeout: 10_000 });
  });

  test("scan API rejects path traversal", async ({ request }) => {
    const res = await request.post("/api/scan", {
      data: { path: "/tmp/../etc/passwd" },
    });
    expect(res.ok()).toBeFalsy();
  });

  test("scan API rejects shell injection characters", async ({ request }) => {
    const res = await request.post("/api/scan", {
      data: { path: "/tmp/skills; rm -rf /" },
    });
    expect(res.ok()).toBeFalsy();
  });

  test("scan API accepts GitHub URL format", async ({ request }) => {
    const res = await request.post("/api/scan", {
      data: { path: "https://github.com/win4r/OpenClaw-Skill" },
    });
    const body = await res.json();
    // Should either succeed or fail at clone stage, not at validation
    if (!res.ok()) {
      expect(body.error).toContain("clone");
    }
  });
});
