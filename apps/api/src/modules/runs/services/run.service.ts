import { randomUUID } from "node:crypto";
import type { Browser } from "playwright";

import { launchBrowser } from "../../../browser/browser-manager.js";

import { generateTestPlan } from "../../planner/service/planner.service.js";
import { mockLLMClient } from "../../planner/clients/mock-llm.client.js";

import { runRepository } from "../repositories/run.repository.js";
import { generateScenarios } from "../utils/generate-scenarios.js";

import type { TestRun } from "../types/run.types.js";
import type { CreateRunInput } from "../schemas/create-run.schema.js";

import { runScenario } from "./scenario-runner.js";

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
  };

  return runRepository.create(testRun);
}

// Execute an existing Run
export async function executeRun(
  runId: string,
  input: CreateRunInput,
): Promise<void> {
  const { configuration, requirements } = input;

  // Step 1: Find existing Run
  const run = runRepository.findById(runId);

  if (!run) {
    throw new Error("Run not found");
  }

  // Step 2: Update status to planning
  runRepository.update(runId, {
    status: "planning",
    startedAt: new Date().toISOString(),
  });

  let browser: Browser | undefined;

  try {
    // Step 3: Generate Test Plan
    const testPlan = await generateTestPlan(
      {
        targetUrl: configuration.targetUrl,
        languages: configuration.languages,
        routes: configuration.routes,
        viewports: configuration.viewports,
        requirements,
      },
      mockLLMClient,
    );

    // Step 4: Save Test Plan and update status
    runRepository.update(runId, {
      testPlan,
      status: "running",
    });

    // Step 5: Launch Browser
    browser = await launchBrowser();

    // Step 6: Execute scenarios one by one
    for (const scenario of run.scenarios) {
      const result = await runScenario(browser, configuration, scenario, runId);

      // Step 7: Save scenario result
      runRepository.addScenarioResult(runId, result);

      // Step 8: Update scenario status
      const updateScenarios = run.scenarios.map((item) =>
        item.id === result.scenarioId
          ? { ...item, status: result.status }
          : item,
      );

      runRepository.update(runId, {
        scenarios: updateScenarios,
      });
    }

    // Step 9: Update Run status to completed
    runRepository.update(runId, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    // Step 10: Update Run status to failed
    runRepository.update(runId, {
      status: "failed",
      completedAt: new Date().toISOString(),
    });

    throw error;
  } finally {
    // Step 11: Close Browser
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
