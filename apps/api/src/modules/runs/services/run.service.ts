import { randomUUID } from "node:crypto";

import { runRepository } from "../repositories/run.repository.js";
import { generateScenarios } from "../utils/generate-scenarios.js";
import type { TestConfiguration } from "../schemas/test-configuration.schema.js";
import type { TestRun } from "../types/run.types.js";

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
  };

  return runRepository.create(testRun);
}

export function getRun(id: string): TestRun | undefined {
  return runRepository.findById(id);
}

export function getAllRuns(): TestRun[] {
  return runRepository.findAll();
}
