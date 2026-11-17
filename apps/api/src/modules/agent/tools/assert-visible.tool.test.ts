import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import type { Browser, BrowserContext, Page } from "playwright";
import { createPage, launchBrowser } from "../../../browser/browser-manager.js";
import { assertVisibleTool } from "./assert-visible.tool.js";

describe("assertVisibleTool", () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  beforeAll(async () => {
    browser = await launchBrowser();
  });

  beforeEach(async () => {
    context = await browser.newContext();
    page = await createPage(context);
  });

  afterEach(async () => {
    await context.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  it("should pass when the element is visible", async () => {
    await page.setContent(`
      <html>
        <body>
          <h1>Dashboard</h1>
        </body>
      </html>
    `);

    const result = await assertVisibleTool.execute(
      { role: "heading", name: "Dashboard" },
      { page },
    );

    expect(result).toEqual({
      success: true,
      data: {
        role: "heading",
        name: "Dashboard",
        passed: true,
        reason: "VISIBLE",
      },
      error: null,
    });
  });

  it("should fail the assertion when the element does not exist", async () => {
    await page.setContent("<html><body></body></html>");

    const result = await assertVisibleTool.execute(
      { role: "heading", name: "Dashboard" },
      { page },
    );

    expect(result).toEqual({
      success: true,
      data: {
        role: "heading",
        name: "Dashboard",
        passed: false,
        reason: "ELEMENT_NOT_FOUND",
      },
      error: null,
    });
  });

  it("should fail the assertion when the element is hidden", async () => {
    await page.setContent(`
      <html>
        <body>
          <h1 style="display: none">Dashboard</h1>
        </body>
      </html>
    `);

    const result = await assertVisibleTool.execute(
      { role: "heading", name: "Dashboard" },
      { page },
    );

    expect(result).toEqual({
      success: true,
      data: {
        role: "heading",
        name: "Dashboard",
        passed: false,
        reason: "ELEMENT_NOT_VISIBLE",
      },
      error: null,
    });
  });

  it("should return AMBIGUOUS_ELEMENT when multiple elements match", async () => {
    await page.setContent(`
      <html>
        <body>
          <h1>Dashboard</h1>
          <h1>Dashboard</h1>
        </body>
      </html>
    `);

    const result = await assertVisibleTool.execute(
      { role: "heading", name: "Dashboard" },
      { page },
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("AMBIGUOUS_ELEMENT");
    }
  });
});
