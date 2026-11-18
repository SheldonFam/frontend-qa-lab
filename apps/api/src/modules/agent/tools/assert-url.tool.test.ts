import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Browser, Page } from "playwright";
import { launchBrowser } from "../../../browser/browser-manager.js";
import { assertUrlTool } from "./assert-url.tool.js";

describe("assertUrlTool", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launchBrowser();

    const context = await browser.newContext();
    page = await context.newPage();

    // Intercept requests so tests don't need a real website.
    await page.route("https://example.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<h1>Test Page</h1>",
      });
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  it("should pass when pathname matches exactly", async () => {
    await page.goto("https://example.com/dashboard");

    const result = await assertUrlTool.execute(
      { expectedPath: "/dashboard" },
      { page },
    );

    expect(result).toEqual({
      success: true,
      data: {
        expectedPath: "/dashboard",
        actualPath: "/dashboard",
        passed: true,
        reason: "URL_MATCHED",
      },
      error: null,
    });
  });

  it("should pass when URL contains query parameters", async () => {
    await page.goto("https://example.com/dashboard?tab=overview");

    const result = await assertUrlTool.execute(
      { expectedPath: "/dashboard" },
      { page },
    );

    expect(result).toEqual({
      success: true,
      data: {
        expectedPath: "/dashboard",
        actualPath: "/dashboard",
        passed: true,
        reason: "URL_MATCHED",
      },
      error: null,
    });
  });

  it("should fail when pathname does not match", async () => {
    await page.goto("https://example.com/login");

    const result = await assertUrlTool.execute(
      { expectedPath: "/dashboard" },
      { page },
    );

    expect(result).toEqual({
      success: true,
      data: {
        expectedPath: "/dashboard",
        actualPath: "/login",
        passed: false,
        reason: "URL_MISMATCH",
      },
      error: null,
    });
  });

  it("should fail when expected path is different", async () => {
    await page.goto("https://example.com/dashboard");

    const result = await assertUrlTool.execute(
      { expectedPath: "/profile" },
      { page },
    );

    expect(result).toEqual({
      success: true,
      data: {
        expectedPath: "/profile",
        actualPath: "/dashboard",
        passed: false,
        reason: "URL_MISMATCH",
      },
      error: null,
    });
  });
});
