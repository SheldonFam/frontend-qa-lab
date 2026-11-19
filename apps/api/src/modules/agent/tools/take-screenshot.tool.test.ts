import { access, rm } from "node:fs/promises";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { Browser, Page } from "playwright";
import { launchBrowser } from "../../../browser/browser-manager.js";
import { takeScreenshotTool } from "./take-screenshot.tool.js";

describe("takeScreenshotTool", () => {
  let browser: Browser;
  let page: Page;

  const runId = "test-run-001";
  const scenarioId = "test-scenario-001";

  const screenshotDirectory = path.join("screenshots", runId);

  const screenshotPath = path.join(screenshotDirectory, `${scenarioId}.png`);

  beforeAll(async () => {
    browser = await launchBrowser();

    const context = await browser.newContext();
    page = await context.newPage();

    await page.route("https://example.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<h1>Screenshot Test</h1>",
      });
    });

    await page.goto("https://example.com/dashboard");
  });

  afterEach(async () => {
    await rm(screenshotDirectory, {
      recursive: true,
      force: true,
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  it("should capture and save a screenshot", async () => {
    const result = await takeScreenshotTool.execute(
      {},
      { page, runId, scenarioId },
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual({
        screenshotPath,
        captured: true,
      });
    }

    await expect(access(screenshotPath)).resolves.toBeUndefined();
  });

  it("should fail when execution context is missing", async () => {
    const result = await takeScreenshotTool.execute({}, { page });

    expect(result).toEqual({
      success: false,
      data: null,
      error: {
        code: "MISSING_EXECUTION_CONTEXT",
        message: "Run ID and Scenario ID are required to save a screenshot",
      },
    });
  });

  it("should fail when execution IDs contain invalid characters", async () => {
    const result = await takeScreenshotTool.execute(
      {},
      {
        page,
        runId: "../invalid",
        scenarioId,
      },
    );

    expect(result).toEqual({
      success: false,
      data: null,
      error: {
        code: "INVALID_EXECUTION_CONTEXT",
        message: "Run ID or Scenario ID contains invalid characters",
      },
    });
  });
});
