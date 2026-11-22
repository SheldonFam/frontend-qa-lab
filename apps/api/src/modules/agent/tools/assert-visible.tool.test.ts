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

  it("should pass when several elements share the name", async () => {
    await page.setContent(`
      <html>
        <body>
          <header><a href="/about">About Us</a></header>
          <footer><a href="/about">About Us</a></footer>
        </body>
      </html>
    `);

    const result = await assertVisibleTool.execute(
      { role: "link", name: "About Us" },
      { page },
    );

    expect(result).toEqual({
      success: true,
      data: {
        role: "link",
        name: "About Us",
        passed: true,
        reason: "VISIBLE",
      },
      error: null,
    });
  });

  it("should pass when one of the matching elements is visible", async () => {
    await page.setContent(`
      <html>
        <body>
          <a href="/about" style="display: none">About Us</a>
          <a href="/about">About Us</a>
        </body>
      </html>
    `);

    const result = await assertVisibleTool.execute(
      { role: "link", name: "About Us" },
      { page },
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.passed).toBe(true);
    }
  });

  it("should ignore capital letters in the name", async () => {
    await page.setContent(`
      <html>
        <body>
          <a href="#" style="text-transform: uppercase">Personal &amp; Business</a>
        </body>
      </html>
    `);

    const result = await assertVisibleTool.execute(
      { role: "link", name: "PERSONAL & BUSINESS" },
      { page },
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.passed).toBe(true);
    }
  });

  it("should not find an element whose name only contains the text", async () => {
    await page.setContent(`
      <html>
        <body>
          <a href="#">Personal &amp; Business</a>
        </body>
      </html>
    `);

    const result = await assertVisibleTool.execute(
      { role: "link", name: "Personal" },
      { page },
    );

    expect(result).toEqual({
      success: true,
      data: {
        role: "link",
        name: "Personal",
        passed: false,
        reason: "ELEMENT_NOT_FOUND",
      },
      error: null,
    });
  });
});
