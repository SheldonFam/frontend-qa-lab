import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Browser, Page } from "playwright";
import { createPage, launchBrowser } from "../../../browser/browser-manager.js";
import { inspectPageTool } from "./inspect-page.tool.js";

describe("inspectPageTool", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launchBrowser();
    const context = await browser.newContext();
    page = await createPage(context);
  });

  afterAll(async () => {
    await browser.close();
  });

  it("should inspect the current webpage", async () => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Login Page</title>
        </head>
        <body>
          <h1>Welcome Back</h1>
          <h2>Sign in to your account</h2>

          <button type="submit">Login</button>

          <a href="/forgot-password" target="_blank">
            Forgot Password?
          </a>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
          />

          <textarea
            name="message"
            placeholder="Enter your message"
          ></textarea>

          <select name="country">
            <option value="my">Malaysia</option>
            <option value="sg">Singapore</option>
          </select>
        </body>
      </html>
    `);

    const result = await inspectPageTool.execute({}, { page });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error(result.error.message);
    }

    expect(result.data.title).toBe("Login Page");

    expect(result.data.headings).toEqual([
      { level: 1, text: "Welcome Back" },
      { level: 2, text: "Sign in to your account" },
    ]);

    expect(result.data.buttons).toEqual([
      {
        text: "Login",
        type: "submit",
        disabled: false,
        isVisible: true,
      },
    ]);

    expect(result.data.links).toEqual([
      {
        text: "Forgot Password?",
        href: "/forgot-password",
        target: "_blank",
        isVisible: true,
      },
    ]);

    expect(result.data.formElements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tagName: "input",
          type: "email",
          name: "email",
          placeholder: "Enter your email",
          disabled: false,
        }),
        expect.objectContaining({
          tagName: "textarea",
          name: "message",
          placeholder: "Enter your message",
          disabled: false,
        }),
        expect.objectContaining({
          tagName: "select",
          name: "country",
          disabled: false,
          options: [
            { text: "Malaysia", value: "my" },
            { text: "Singapore", value: "sg" },
          ],
        }),
      ]),
    );
  });
});
