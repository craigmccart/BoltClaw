import { test, expect } from "@playwright/test";
import { APP_URL, API_TOKEN } from "./helpers.js";

test.describe("Dashboard loads", () => {
  test("serves the frontend", async ({ page }) => {
    await page.goto(APP_URL);
    await expect(page.locator("header")).toContainText("BoltClaw");
  });

  test("shows all four navigation tabs", async ({ page }) => {
    await page.goto(APP_URL);
    const nav = page.locator("nav");
    await expect(nav.getByText("Setup Wizard")).toBeVisible();
    await expect(nav.getByText("Permissions")).toBeVisible();
    await expect(nav.getByText("Skill Scanner")).toBeVisible();
    await expect(nav.getByText("Audit Log")).toBeVisible();
  });

  test("health endpoint returns ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("ok");
  });
});

test.describe("Token handling", () => {
  // These use a fresh browser context with no auth header, the way a
  // stranger's browser (or another program) would reach the dashboard.
  const baseURL = "http://localhost:3000";

  test("bare URL shows the sign-in notice, not the dashboard", async ({ browser }) => {
    const context = await browser.newContext({ baseURL, extraHTTPHeaders: {} });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByText("BoltClaw needs its access token")).toBeVisible();
    await expect(page.locator("nav")).toHaveCount(0);
    await context.close();
  });

  test("pages served without a token never contain it", async ({ playwright }) => {
    const anonymous = await playwright.request.newContext({ baseURL, extraHTTPHeaders: {} });
    for (const path of ["/", "/anything", "/deep/link"]) {
      const res = await anonymous.get(path);
      const body = await res.text();
      expect(body).not.toContain(API_TOKEN);
      expect(body).not.toContain("__BOLTCLAW_TOKEN__=");
    }
    const api = await anonymous.get("/api/config");
    expect(api.status()).toBe(401);
    await anonymous.dispose();
  });

  test("token is removed from the address bar and survives a reload", async ({ browser }) => {
    const context = await browser.newContext({ baseURL, extraHTTPHeaders: {} });
    const page = await context.newPage();
    await page.goto(APP_URL);
    await expect(page.locator("nav").getByText("Setup Wizard")).toBeVisible();
    expect(page.url()).not.toContain("token=");
    await page.reload();
    await expect(page.locator("nav").getByText("Setup Wizard")).toBeVisible();
    await context.close();
  });
});
