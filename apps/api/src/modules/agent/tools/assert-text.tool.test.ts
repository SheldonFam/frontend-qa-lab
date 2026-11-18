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

  it("should pass when the text matches", async () => {
    await page.setContent(`
      <html>
        <body>
          <div role="alert">Invalid password</div>
        </body>
      </html>
    `);

    const result = await assertTextTool.execute(
      {
        role: "alert",
        expectedText: "Invalid password",
      },
      { page },
    );

    expect(result).toEqual({
      success: true,
      data: {
        role: "alert",
        expectedText: "Invalid password",
        actualText: "Invalid password",
        passed: true,
        reason: "TEXT_MATCHED",
      },
      error: null,
    });
  });

  it("should fail when the text does not match", async () => {
    await page.setContent(`
      <html>
        <body>
          <div role="alert">Invalid password</div>
        </body>
      </html>
    `);

    const result = await assertTextTool.execute(
      {
        role: "alert",
        expectedText: "Login successful",
      },
      { page },
    );

    expect(result).toEqual({
      success: true,
      data: {
        role: "alert",
        expectedText: "Login successful",
        actualText: "Invalid password",
        passed: false,
        reason: "TEXT_MISMATCH",
      },
      error: null,
    });
  });

  it("should return a failed assertion when the element does not exist", async () => {
    await page.setContent("<html><body></body></html>");

    const result = await assertTextTool.execute(
      {
        role: "alert",
        expectedText: "Invalid password",
      },
      { page },
    );

    expect(result).toEqual({
      success: true,
      data: {
        role: "alert",
        expectedText: "Invalid password",
        actualText: "",
        passed: false,
        reason: "TEXT_MISMATCH",
      },
      error: null,
    });
  });

  it("should return AMBIGUOUS_ELEMENT when multiple elements match", async () => {
    await page.setContent(`
      <html>
        <body>
          <div role="alert">Invalid password</div>
          <div role="alert">Account locked</div>
        </body>
      </html>
    `);

    const result = await assertTextTool.execute(
      {
        role: "alert",
        expectedText: "Invalid password",
      },
      { page },
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("AMBIGUOUS_ELEMENT");
    }
  });
});
