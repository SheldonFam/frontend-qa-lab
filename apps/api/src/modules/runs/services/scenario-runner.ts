import type { Browser } from "playwright";

import type { TestConfiguration } from "../schemas/test-configuration.schema.js";
import type { ScenarioResult, TestScenario } from "../types/scenario.types.js";

import {
  createBrowserContext,
  createPage,
} from "../../../browser/browser-manager.js";
import { mkdir } from "node:fs/promises";
import path from "node:path";

export async function runScenario(
  browser: Browser,
  configuration: TestConfiguration,
  scenario: TestScenario,
  runId: string,
): Promise<ScenarioResult> {
  const context = await createBrowserContext(browser, scenario.viewport);

  // Store browser errors and failed requests collected during execution
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  const assertions: ScenarioResult["assertions"] = [];

  let url = configuration.targetUrl;
  let buttons: ScenarioResult["buttons"] = [];
  let inputs: ScenarioResult["inputs"] = [];
  let screenshotPath: string | null = null;

  try {
    // 1. Build the complete URL
    url = new URL(scenario.route, configuration.targetUrl).toString();

    // 2. Create a new Page
    const page = await createPage(context);

    // 3. Listen for Console Errors
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    // 4. Listen for JavaScript Runtime Errors
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    // 5. Listen for Failed Network Requests
    page.on("requestfailed", (request) => {
      failedRequests.push(request.url());
    });

    // 6. Navigate to the target URL
    await page.goto(url);

    // 7. Wait for delayed browser errors
    await page.waitForTimeout(1000);

    // 8. Prepare screenshot directory
    const screenshotDir = path.join(process.cwd(), "screenshots", runId);

    await mkdir(screenshotDir, { recursive: true });

    // 9. Generate screenshot path
    const outputPath = path.join(screenshotDir, `${scenario.id}.png`);

    // 10. Capture screenshot
    await page.screenshot({
      path: outputPath,
      fullPage: true,
    });

    screenshotPath = outputPath;

    // 12. Get the page title
    const title = await page.title();

    const hasTitle = title.trim().length > 0;

    assertions.push({
      name: "page-title",
      passed: hasTitle,
      message: hasTitle ? "Page title exists" : "Page title is empty",
    });

    // Check whether the page has at least one h1 heading
    const headingCount = await page.locator("h1").count();
    const hasHeading = headingCount > 0;

    assertions.push({
      name: "page-heading",
      passed: hasHeading,
      message: hasHeading ? "Page heading exists" : "Page heading is missing",
    });

    // 13. Collect Buttons
    buttons = await page.locator("button").evaluateAll((elements) =>
      elements.map((element) => ({
        text: element.textContent?.trim() ?? "",
        disabled: (element as HTMLButtonElement).disabled,
      })),
    );

    // 14. Collect Inputs
    inputs = await page.locator("input").evaluateAll((elements) =>
      elements.map((element) => ({
        type: (element as HTMLInputElement).type,
        name: element.getAttribute("name"),
        placeholder: element.getAttribute("placeholder"),
        disabled: (element as HTMLInputElement).disabled,
      })),
    );

    // 15. Return successful result
    return {
      scenarioId: scenario.id,
      status: assertions.every((assertion) => assertion.passed)
        ? "passed"
        : "failed",
      url,
      title,
      consoleErrors,
      pageErrors,
      failedRequests,
      error: null,
      inputs,
      buttons,
      assertions,
      screenshotPath,
    };
  } catch (error: unknown) {
    // 16. Return failed result
    return {
      scenarioId: scenario.id,
      status: "failed",
      url,
      title: null,
      consoleErrors,
      pageErrors,
      failedRequests,
      error: error instanceof Error ? error.message : String(error),
      inputs: [],
      buttons: [],
      assertions,
      screenshotPath,
    };
  } finally {
    // 17. Always close the BrowserContext
    await context.close();
  }
}
