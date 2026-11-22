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
import { clickElementTool } from "./click-element.tool.js";

describe("clickElementTool", () => {
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

  it("should click a button successfully", async () => {
    await page.setContent(`
      <html>
        <body>
          <button onclick="document.body.dataset.clicked = 'true'">
            Login
          </button>
        </body>
      </html>
    `);

    const result = await clickElementTool.execute(
      { role: "button", name: "Login" },
      { page },
    );

    expect(result).toEqual({
      success: true,
      data: {
        role: "button",
        name: "Login",
        clicked: true,
      },
      error: null,
    });

    expect(await page.locator("body").getAttribute("data-clicked")).toBe(
      "true",
    );
  });

  it("should return ELEMENT_NOT_FOUND when the element does not exist", async () => {
    await page.setContent("<html><body></body></html>");

    const result = await clickElementTool.execute(
      { role: "button", name: "Login" },
      { page },
    );

    expect(result).toEqual({
      success: false,
      data: null,
      error: {
        code: "ELEMENT_NOT_FOUND",
        message: 'No button named "Login" was found',
      },
    });
  });

  it("should return AMBIGUOUS_ELEMENT when multiple elements match", async () => {
    await page.setContent(`
      <html>
        <body>
          <button>Login</button>
          <button>Login</button>
        </body>
      </html>
    `);

    const result = await clickElementTool.execute(
      { role: "button", name: "Login" },
      { page },
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("AMBIGUOUS_ELEMENT");
    }
  });

  it("should return ELEMENT_NOT_VISIBLE when the element is hidden", async () => {
    await page.setContent(`
      <html>
        <body>
          <button style="display: none">Login</button>
        </body>
      </html>
    `);

    const result = await clickElementTool.execute(
      { role: "button", name: "Login" },
      { page },
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("ELEMENT_NOT_VISIBLE");
    }
  });

  it("should return ELEMENT_DISABLED when the element is disabled", async () => {
    await page.setContent(`
      <html>
        <body>
          <button disabled>Login</button>
        </body>
      </html>
    `);

    const result = await clickElementTool.execute(
      { role: "button", name: "Login" },
      { page },
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("ELEMENT_DISABLED");
    }
  });

  it("should click the element chosen with occurrence", async () => {
    await page.setContent(`
      <html>
        <body>
          <button onclick="document.body.dataset.clicked = 'first'">Close</button>
          <button onclick="document.body.dataset.clicked = 'second'">Close</button>
        </body>
      </html>
    `);

    const result = await clickElementTool.execute(
      { role: "button", name: "Close", occurrence: 2 },
      { page },
    );

    expect(result.success).toBe(true);
    expect(await page.locator("body").getAttribute("data-clicked")).toBe(
      "second",
    );
  });

  it("should return OCCURRENCE_NOT_FOUND when occurrence is too large", async () => {
    await page.setContent(`
      <html>
        <body>
          <button>Close</button>
          <button>Close</button>
        </body>
      </html>
    `);

    const result = await clickElementTool.execute(
      { role: "button", name: "Close", occurrence: 3 },
      { page },
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("OCCURRENCE_NOT_FOUND");
    }
  });

  it("should ignore a hidden element with the same name", async () => {
    await page.setContent(`
      <html>
        <body>
          <button style="display: none">Menu</button>
          <button onclick="document.body.dataset.clicked = 'visible'">Menu</button>
        </body>
      </html>
    `);

    const result = await clickElementTool.execute(
      { role: "button", name: "Menu" },
      { page },
    );

    expect(result.success).toBe(true);
    expect(await page.locator("body").getAttribute("data-clicked")).toBe(
      "visible",
    );
  });

  it("should ignore capital letters in the name", async () => {
    await page.setContent(`
      <html>
        <body>
          <a
            href="#"
            style="text-transform: uppercase"
            onclick="document.body.dataset.clicked = 'true'"
          >
            Personal &amp; Business
          </a>
        </body>
      </html>
    `);

    const result = await clickElementTool.execute(
      { role: "link", name: "PERSONAL & BUSINESS" },
      { page },
    );

    expect(result.success).toBe(true);
    expect(await page.locator("body").getAttribute("data-clicked")).toBe(
      "true",
    );
  });

  it("should not click an element whose name only contains the text", async () => {
    await page.setContent(`
      <html>
        <body>
          <a href="#">Personal &amp; Business</a>
        </body>
      </html>
    `);

    const result = await clickElementTool.execute(
      { role: "link", name: "Personal" },
      { page },
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("ELEMENT_NOT_FOUND");
    }
  });

  it("should return CLICK_FAILED when another element covers the button", async () => {
    await page.setContent(`
      <html>
        <body>
          <button onclick="document.body.dataset.clicked = 'true'">Close</button>
          <div style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5)"></div>
        </body>
      </html>
    `);

    const result = await clickElementTool.execute(
      { role: "button", name: "Close" },
      { page },
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("CLICK_FAILED");
    }

    expect(await page.locator("body").getAttribute("data-clicked")).toBeNull();
  }, 20_000);
});
