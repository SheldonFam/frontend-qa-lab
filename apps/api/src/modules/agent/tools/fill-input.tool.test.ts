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
import { fillInputTool } from "./fill-input.tool.js";

describe("fillInputTool", () => {
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

  it("should fill an input successfully", async () => {
    await page.setContent(`
      <html>
        <body>
          <label for="email">Email</label>
          <input id="email" type="email" />
        </body>
      </html>
    `);

    const result = await fillInputTool.execute(
      { name: "Email", value: "test@example.com" },
      { page },
    );

    expect(result).toEqual({
      success: true,
      data: {
        name: "Email",
        filled: true,
      },
      error: null,
    });

    const actualValue = await page.locator("#email").inputValue();

    expect(actualValue).toBe("test@example.com");
  });

  it("should fill a password input successfully", async () => {
    await page.setContent(`
      <html>
        <body>
          <label for="password">Password</label>
          <input id="password" type="password" />
        </body>
      </html>
    `);

    const result = await fillInputTool.execute(
      { name: "Password", value: "Password123!" },
      { page },
    );

    expect(result.success).toBe(true);

    const actualValue = await page.locator("#password").inputValue();

    expect(actualValue).toBe("Password123!");
  });

  it("should fill a textarea successfully", async () => {
    await page.setContent(`
      <html>
        <body>
          <label for="message">Message</label>
          <textarea id="message"></textarea>
        </body>
      </html>
    `);

    const result = await fillInputTool.execute(
      { name: "Message", value: "Hello World" },
      { page },
    );

    expect(result.success).toBe(true);

    const actualValue = await page.locator("#message").inputValue();

    expect(actualValue).toBe("Hello World");
  });

  it("should return ELEMENT_NOT_FOUND when the input does not exist", async () => {
    await page.setContent("<html><body></body></html>");

    const result = await fillInputTool.execute(
      { name: "Email", value: "test@example.com" },
      { page },
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("ELEMENT_NOT_FOUND");
    }
  });

  it("should return AMBIGUOUS_ELEMENT when multiple inputs match", async () => {
    await page.setContent(`
      <html>
        <body>
          <label for="email-1">Email</label>
          <input id="email-1" type="email" />

          <label for="email-2">Email</label>
          <input id="email-2" type="email" />
        </body>
      </html>
    `);

    const result = await fillInputTool.execute(
      { name: "Email", value: "test@example.com" },
      { page },
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("AMBIGUOUS_ELEMENT");
    }
  });

  it("should return ELEMENT_NOT_VISIBLE when the input is hidden", async () => {
    await page.setContent(`
      <html>
        <body>
          <label for="email">Email</label>
          <input id="email" type="email" style="display: none" />
        </body>
      </html>
    `);

    const result = await fillInputTool.execute(
      { name: "Email", value: "test@example.com" },
      { page },
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("ELEMENT_NOT_VISIBLE");
    }
  });

  it("should return ELEMENT_DISABLED when the input is disabled", async () => {
    await page.setContent(`
      <html>
        <body>
          <label for="email">Email</label>
          <input id="email" type="email" disabled />
        </body>
      </html>
    `);

    const result = await fillInputTool.execute(
      { name: "Email", value: "test@example.com" },
      { page },
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("ELEMENT_DISABLED");
    }
  });

  it("should return ELEMENT_NOT_EDITABLE when the input is readonly", async () => {
    await page.setContent(`
      <html>
        <body>
          <label for="email">Email</label>
          <input id="email" type="email" readonly />
        </body>
      </html>
    `);

    const result = await fillInputTool.execute(
      { name: "Email", value: "test@example.com" },
      { page },
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("ELEMENT_NOT_EDITABLE");
    }
  });
});
