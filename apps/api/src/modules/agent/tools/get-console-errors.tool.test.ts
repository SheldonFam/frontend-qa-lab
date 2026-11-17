import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Browser, Page } from "playwright";
import { launchBrowser } from "../../../browser/browser-manager.js";
import { getConsoleErrorsTool } from "./get-console-errors.tool.js";

describe("getConsoleErrorsTool", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launchBrowser();

    const context = await browser.newContext();
    page = await context.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it("should return collected console errors", async () => {
    const diagnostics = {
      consoleErrors: ["Failed to load user profile", "Something went wrong"],
      pageErrors: [],
      failedRequests: [],
    };

    const result = await getConsoleErrorsTool.execute(
      {},
      { page, diagnostics },
    );

    expect(result).toEqual({
      success: true,
      data: {
        errors: ["Failed to load user profile", "Something went wrong"],
        total: 2,
      },
      error: null,
    });
  });

  it("should return an empty array when there are no console errors", async () => {
    const diagnostics = {
      consoleErrors: [],
      pageErrors: [],
      failedRequests: [],
    };

    const result = await getConsoleErrorsTool.execute(
      {},
      { page, diagnostics },
    );

    expect(result).toEqual({
      success: true,
      data: {
        errors: [],
        total: 0,
      },
      error: null,
    });
  });

  it("should fail when diagnostics context is missing", async () => {
    const result = await getConsoleErrorsTool.execute({}, { page });

    expect(result).toEqual({
      success: false,
      data: null,
      error: {
        code: "MISSING_DIAGNOSTICS_CONTEXT",
        message: "Browser diagnostics are not available",
      },
    });
  });
});
