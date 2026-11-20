import type { Browser, Page } from "playwright";

import type { AgentClient } from "../clients/agent-client.js";
import type { BrowserDiagnostics } from "../types/tool.types.js";

import { createAgentRuntime } from "./agent-runtime.js";
import { buildAgentMessages } from "./build-agent-messages.js";
import { buildAssertions } from "./build-assertions.js";
import { getPageDetails } from "./get-page-details.js";
import { getErrorSummary } from "../../../utils/get-error-summary.js";
import { saveScreenshot } from "../../../utils/screenshots.js";

import type { TestPlan } from "../../planner/schemas/test-plan.schema.js";
import type { TestConfiguration } from "../../runs/schemas/test-configuration.schema.js";
import type {
  ScenarioResult,
  TestScenario,
} from "../../runs/types/scenario.types.js";

const allowedTools = [
  "inspect_page",
  "click_element",
  "fill_input",
  "assert_visible",
  "assert_text",
  "assert_url",
  "take_screenshot",
  "get_console_errors",
  "get_failed_requests",
];

const MAX_AGENT_STEPS = 20;

async function tryToSaveScreenshot(
  page: Page,
  runId: string,
  scenarioId: string,
): Promise<string | null> {
  try {
    return await saveScreenshot(page, runId, scenarioId);
  } catch {
    return null;
  }
}

function copyDiagnostics(
  result: ScenarioResult,
  diagnostics: BrowserDiagnostics,
): void {
  result.consoleErrors = [...diagnostics.consoleErrors];
  result.pageErrors = [...diagnostics.pageErrors];
  result.failedRequests = [...diagnostics.failedRequests];
}

export async function runAgentScenario(
  browser: Browser,
  configuration: TestConfiguration,
  scenario: TestScenario,
  testPlan: TestPlan,
  runId: string,
  agentClient?: AgentClient,
): Promise<ScenarioResult> {
  const result: ScenarioResult = {
    scenarioId: scenario.id,
    status: "failed",
    url: configuration.targetUrl,
    title: null,
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    buttons: [],
    inputs: [],
    error: null,
    assertions: [],
    agentSteps: [],
    agentSummary: null,
    failureAnalysis: null,
    screenshotPath: null,
  };

  let runtime: Awaited<ReturnType<typeof createAgentRuntime>> | undefined;
  let pageLoaded = false;

  try {
    if (testPlan.steps.length === 0) {
      throw new Error("The test plan has no steps for this scenario");
    }

    // 1. Build the Scenario URL
    result.url = new URL(scenario.route, configuration.targetUrl).toString();

    // 2. Create Agent Runtime
    runtime = await createAgentRuntime(browser, {
      runId,
      scenarioId: scenario.id,
      viewport: scenario.viewport,
      allowedTools,
    });

    // 3. Navigate to the Scenario URL
    await runtime.page.goto(result.url);

    pageLoaded = true;

    // 4. Prepare Agent messages
    const messages = buildAgentMessages(result.url, scenario, testPlan);

    // 5. Execute Agent Loop
    const agentResult = await runtime.runAgent({
      client: agentClient,
      messages,
      maxSteps: MAX_AGENT_STEPS,
    });

    result.agentSteps = [...runtime.agentSteps];
    result.agentSummary = agentResult.message;

    // 6. Collect actual Assertion results
    const assertionResult = buildAssertions(agentResult.messages);

    result.assertions = assertionResult.assertions;
    result.error = assertionResult.error;

    if (agentResult.status === "max_steps_reached") {
      result.error = [
        result.error,
        `Agent reached the maximum step limit (${MAX_AGENT_STEPS})`,
      ]
        .filter(Boolean)
        .join("; ");
    }

    if (result.assertions.length === 0 && result.error === null) {
      result.error = "Agent did not execute any assertions";
    }

    // 7. Inspect the final page for result evidence
    const inspection = await runtime.executeTool("inspect_page", {});
    const pageDetails = getPageDetails(inspection);

    if (pageDetails.url !== null) {
      result.url = pageDetails.url;
    }

    result.title = pageDetails.title;
    result.buttons = pageDetails.buttons;
    result.inputs = pageDetails.inputs;

    // 8. Collect Browser Diagnostics
    copyDiagnostics(result, runtime.diagnostics);

    // 9. Capture screenshot
    result.screenshotPath = await tryToSaveScreenshot(
      runtime.page,
      runId,
      scenario.id,
    );

    // 10. Determine final Scenario status
    const passed =
      result.error === null &&
      result.assertions.length > 0 &&
      result.assertions.every((assertion) => assertion.passed);

    result.status = passed ? "passed" : "failed";

    return result;
  } catch (caughtError: unknown) {
    console.error(`Scenario ${scenario.id} failed:`, caughtError);

    result.error = getErrorSummary(caughtError);

    if (runtime && pageLoaded) {
      result.screenshotPath = await tryToSaveScreenshot(
        runtime.page,
        runId,
        scenario.id,
      );
    }

    if (runtime) {
      copyDiagnostics(result, runtime.diagnostics);
      result.agentSteps = [...runtime.agentSteps];
    }

    return result;
  } finally {
    // 11. Always close the Browser Context
    if (runtime) {
      await runtime.close();
    }
  }
}
