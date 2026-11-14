import { randomUUID } from "node:crypto";
import type { Browser } from "playwright";

import { launchBrowser } from "../../../browser/browser-manager.js";

import { runRepository } from "../repositories/run.repository.js";
import { generateScenarios } from "../utils/generate-scenarios.js";

import type { TestConfiguration } from "../schemas/test-configuration.schema.js";
import type { TestRun } from "../types/run.types.js";

import { runScenario } from "./scenario-runner.js";

// Create a new Run
export function createRun(configuration: TestConfiguration): TestRun {
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
  };

  return runRepository.create(testRun);
}

// Execute an existing Run
export async function executeRun(
  runId: string,
  configuration: TestConfiguration,
): Promise<void> {
  // Step 1: Find existing Run
  const run = runRepository.findById(runId);

  if (!run) {
    throw new Error("Run not found");
  }

  // Step 2: Update status to running
  runRepository.update(runId, {
    status: "running",
    startedAt: new Date().toISOString(),
  });

  let browser: Browser | undefined;

  try {
    // Step 3: Launch Browser
    browser = await launchBrowser();

    // Step 4: Execute scenarios one by one
    for (const scenario of run.scenarios) {
      // Execute one scenario
      const result = await runScenario(browser, configuration, scenario, runId);

      // Step 5: Save scenario result
      runRepository.addScenarioResult(runId, result);

      // Step 6: Update status to completed
      const updateScenarios = run.scenarios.map((item) =>
        item.id === result.scenarioId
          ? { ...item, status: result.status }
          : item,
      );

      runRepository.update(runId, {
        scenarios: updateScenarios,
      });
    }
    // Step 7: Update Run status to completed
    runRepository.update(runId, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    // Step 8: Update status to failed
    runRepository.update(runId, {
      status: "failed",
      completedAt: new Date().toISOString(),
    });

    throw error;
  } finally {
    // Step 9: Close Browser
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
