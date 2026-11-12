import type { Browser } from "playwright";

import type { TestConfiguration } from "../schemas/test-configuration.schema.js";
import type { ScenarioResult, TestScenario } from "../types/scenario.types.js";

import {
  createBrowserContext,
  createPage,
} from "../../../browser/browser-manager.js";

export async function runScenario(
  browser: Browser,
  configuration: TestConfiguration,
  scenario: TestScenario,
): Promise<ScenarioResult> {
  const context = await createBrowserContext(browser, scenario.viewport);

  let url = configuration.targetUrl;

  try {
    // 1. Build the complete URL
    url = new URL(scenario.route, configuration.targetUrl).toString();

    // 2. Create a new Page
    const page = await createPage(context);

    // 3. Navigate to the target URL
    await page.goto(url);

    // 4. Get the page title
    const title = await page.title();

    // 5. Return successful result
    return {
      scenarioId: scenario.id,
      status: "passed",
      url,
      title,
      error: null,
    };
  } catch (error: unknown) {
    // 6. Return failed result
    return {
      scenarioId: scenario.id,
      status: "failed",
      url,
      title: null,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    // 7. Always close the BrowserContext
    await context.close();
  }
}
