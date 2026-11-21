import { randomUUID } from "node:crypto";
import type { Browser } from "playwright";

import { launchBrowser } from "../../../browser/browser-manager.js";

import type { AgentClient } from "../../agent/clients/agent-client.js";

import { generateTestPlan } from "../../planner/service/planner.service.js";
import { getPlannerClient } from "../../planner/clients/planner-client.js";
import { mapTestPlanToScenario } from "../../planner/service/test-plan-mapper.js";

import { runRepository } from "../repositories/run.repository.js";
import { generateScenarios } from "../utils/generate-scenarios.js";

import type { TestRun } from "../types/run.types.js";
import type { CreateRunInput } from "../schemas/create-run.schema.js";

import { runAgentScenario } from "../../agent/runtime/agent-scenario-runner.js";
import { analyzeFailure } from "../../analysis/failure-analysis.service.js";
import { getErrorSummary } from "../../../utils/get-error-summary.js";

const RESTART_ERROR_MESSAGE = "The API restarted before this run finished.";

// Create a new Run
export function createRun(input: CreateRunInput): TestRun {
  const { configuration, requirements } = input;

  const scenarios = generateScenarios(configuration);

  const testRun: TestRun = {
    id: randomUUID(),
    targetUrl: configuration.targetUrl,
    status: "queued",
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    scenarios,
    results: [],
    requirements,
    testPlan: null,
    error: null,
  };

  return runRepository.create(testRun);
}

// Execute an existing Run
export async function executeRun(
  runId: string,
  input: CreateRunInput,
  agentClient?: AgentClient,
): Promise<void> {
  const { configuration, requirements } = input;

  const run = runRepository.findById(runId);

  if (!run) {
    throw new Error("Run not found");
  }

  runRepository.update(runId, {
    status: "planning",
    startedAt: new Date().toISOString(),
  });

  let browser: Browser | undefined;

  try {
    // Step 1: Generate Global Test Plan
    const testPlan = await generateTestPlan(
      {
        targetUrl: configuration.targetUrl,
        languages: configuration.languages,
        routes: configuration.routes,
        viewports: configuration.viewports,
        requirements,
      },
      getPlannerClient(),
    );

    // Step 2: Save Global Test Plan
    runRepository.update(runId, {
      testPlan,
      status: "running",
    });

    // Step 3: Launch Browser
    browser = await launchBrowser();

    // Step 4: Execute scenarios using Agent
    for (const scenario of run.scenarios) {
      // Map the global Test Plan to the current scenario
      const scenarioTestPlan = mapTestPlanToScenario(testPlan, scenario);

      const result = await runAgentScenario(
        browser,
        configuration,
        scenario,
        scenarioTestPlan,
        runId,
        agentClient,
      );

      if (result.status === "failed") {
        result.failureAnalysis = await analyzeFailure({
          scenario,
          testPlan: scenarioTestPlan,
          result,
        });
      }

      // Step 5: Save scenario result and status
      runRepository.addScenarioResult(runId, result);
    }

    // Step 6: Update Run status
    runRepository.update(runId, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    runRepository.update(runId, {
      status: "failed",
      completedAt: new Date().toISOString(),
      error: getErrorSummary(error),
    });

    throw error;
  } finally {
    // Step 7: Close Browser
    if (browser) {
      await browser.close();
    }
  }
}

// Get one Run
export function getRun(id: string): TestRun | undefined {
  return runRepository.findById(id);
}

// Get all Runs
export function getAllRuns(): TestRun[] {
  return runRepository.findAll();
}

export function failUnfinishedRuns(): void {
  runRepository.failUnfinishedRuns(RESTART_ERROR_MESSAGE);
}
