import {
  afterAll,
  beforeAll,
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
} from "vitest";
import type { Browser, BrowserContext, Page } from "playwright";

import { launchBrowser } from "../../../browser/browser-manager.js";
import {
  attachBrowserDiagnostics,
  createBrowserDiagnostics,
} from "./browser-diagnostics.js";

describe("browser diagnostics", () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  beforeAll(async () => {
    browser = await launchBrowser();
  });

  beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  afterEach(async () => {
    await context.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  it("should create empty diagnostics", () => {
    const diagnostics = createBrowserDiagnostics();

    expect(diagnostics).toEqual({
      consoleErrors: [],
      pageErrors: [],
      failedRequests: [],
    });
  });

  it("should collect console errors", async () => {
    const diagnostics = createBrowserDiagnostics();

    attachBrowserDiagnostics(page, diagnostics);

    await page.evaluate(() => {
      console.error("Something went wrong");
    });

    expect(diagnostics.consoleErrors).toContain("Something went wrong");
  });

  it("should collect JavaScript runtime errors", async () => {
    const diagnostics = createBrowserDiagnostics();

    attachBrowserDiagnostics(page, diagnostics);

    const pageErrorPromise = page.waitForEvent("pageerror");

    await page.evaluate(() => {
      setTimeout(() => {
        throw new Error("Runtime error");
      }, 0);
    });

    await pageErrorPromise;

    expect(diagnostics.pageErrors).toContain("Runtime error");
  });

  it("should collect failed network requests", async () => {
    const diagnostics = createBrowserDiagnostics();

    attachBrowserDiagnostics(page, diagnostics);

    await page.route("https://example.com/failed-resource", (route) =>
      route.abort(),
    );

    await page.goto("https://example.com");

    const failedRequestPromise = page.waitForEvent("requestfailed");

    await page.evaluate(async () => {
      await fetch("/failed-resource").catch(() => undefined);
    });

    await failedRequestPromise;

    expect(diagnostics.failedRequests).toHaveLength(1);
    expect(diagnostics.failedRequests[0]).toContain(
      "https://example.com/failed-resource",
    );
  });
});
