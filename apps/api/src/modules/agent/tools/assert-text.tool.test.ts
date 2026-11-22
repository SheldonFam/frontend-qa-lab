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
import { assertTextTool } from "./assert-text.tool.js";

describe("assertTextTool", () => {
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

  it("should pass when the page shows the text", async () => {
    await page.setContent(`
      <html>
        <body>
          <h1>Dashboard</h1>
        </body>
      </html>
    `);

    const result = await assertTextTool.execute(
      { text: "Dashboard" },
      { page },
    );

    expect(result).toEqual({
      success: true,
      data: {
        text: "Dashboard",
        passed: true,
        reason: "TEXT_FOUND",
      },
      error: null,
    });
  });

  it("should pass when the text is part of a longer sentence", async () => {
    await page.setContent(`
      <html>
        <body>
          <a href="#">Personal &amp; Business</a>
          <p>Welcome back, Sheldon. You have 3 new messages.</p>
        </body>
      </html>
    `);

    for (const text of ["Personal", "Business", "3 new messages"]) {
      const result = await assertTextTool.execute({ text }, { page });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.passed).toBe(true);
      }
    }
  });

  it("should ignore capital letters", async () => {
    await page.setContent(`
      <html>
        <body>
          <a href="#" style="text-transform: uppercase">Personal &amp; Business</a>
        </body>
      </html>
    `);

    const result = await assertTextTool.execute(
      { text: "PERSONAL & BUSINESS" },
      { page },
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.passed).toBe(true);
    }
  });

  it("should pass when several elements show the text", async () => {
    await page.setContent(`
      <html>
        <body>
          <button>Close</button>
          <button>Close</button>
          <a href="#">About Us</a>
          <a href="#">About Us</a>
        </body>
      </html>
    `);

    const result = await assertTextTool.execute({ text: "Close" }, { page });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.passed).toBe(true);
    }
  });

  it("should find text on a page that is plain text", async () => {
    await page.setContent(
      '<html><body><pre>{\n  "headers": {\n    "Accept-Language": "ms"\n  }\n}</pre></body></html>',
    );

    const result = await assertTextTool.execute(
      { text: '"Accept-Language": "ms"' },
      { page },
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.passed).toBe(true);
    }
  });

  it("should fail when the page does not show the text", async () => {
    await page.setContent(`
      <html>
        <body>
          <h1>Dashboard</h1>
        </body>
      </html>
    `);

    const result = await assertTextTool.execute({ text: "Settings" }, { page });

    expect(result).toEqual({
      success: true,
      data: {
        text: "Settings",
        passed: false,
        reason: "TEXT_NOT_FOUND",
      },
      error: null,
    });
  });

  it("should fail when the text is only in a hidden element", async () => {
    await page.setContent(`
      <html>
        <body>
          <h1>Dashboard</h1>
          <p style="display: none">Email is required</p>
        </body>
      </html>
    `);

    const result = await assertTextTool.execute(
      { text: "Email is required" },
      { page },
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.passed).toBe(false);
      expect(result.data.reason).toBe("TEXT_NOT_FOUND");
    }
  });
});
