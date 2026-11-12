import { beforeEach, describe, expect, it } from "vitest";

import { runRepository } from "./run.repository.js";

import type { TestRun } from "../types/run.types.js";
import type { ScenarioResult } from "../types/scenario.types.js";

describe("runRepository", () => {
  beforeEach(() => {
    runRepository.clear();
  });

  it("should add a scenario result to an existing run", () => {
    const testRun: TestRun = {
      id: "run-001",
      targetUrl: "https://example.com",
      status: "running",
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      completedAt: null,
      scenarios: [],
      results: [],
    };

    const result: ScenarioResult = {
      scenarioId: "scenario-001",
      status: "passed",
      url: "https://example.com/about",
      title: "About Us",
      error: null,
    };

    runRepository.create(testRun);
    runRepository.addScenarioResult("run-001", result);
    const run = runRepository.findById("run-001");

    expect(run?.results).toHaveLength(1);
    expect(run?.results[0]).toEqual(result);
  });

  it("should add multiple scenario results to an existing run", () => {
    const testRun: TestRun = {
      id: "run-001",
      targetUrl: "https://example.com",
      status: "running",
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      completedAt: null,
      scenarios: [],
      results: [],
    };

    const result1: ScenarioResult = {
      scenarioId: "scenario-001",
      status: "passed",
      url: "https://example.com/about",
      title: "About Us",
      error: null,
    };

    const result2: ScenarioResult = {
      scenarioId: "scenario-002",
      status: "failed",
      url: "https://example.com/contact",
      title: null,
      error: "Navigation failed",
    };

    runRepository.create(testRun);

    runRepository.addScenarioResult("run-001", result1);
    runRepository.addScenarioResult("run-001", result2);

    const run = runRepository.findById("run-001");

    expect(run?.results).toHaveLength(2);
  });

  it("should throw an error when run does not exist", () => {
    const result: ScenarioResult = {
      scenarioId: "scenario-001",
      status: "passed",
      url: "https://example.com/about",
      title: "About Us",
      error: null,
    };

    expect(() => {
      runRepository.addScenarioResult("invalid-id", result);
    }).toThrow("Run not found");
  });
});
