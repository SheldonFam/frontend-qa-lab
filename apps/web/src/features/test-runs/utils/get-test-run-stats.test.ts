import { describe, expect, it } from "vitest";

import type { TestRun, TestRunStatus } from "../types/test-run";

import { getTestRunStats } from "./get-test-run-stats";

function createTestRun(status: TestRunStatus): TestRun {
  return {
    id: `run-${status}`,
    name: "example.com",
    targetUrl: "https://example.com",
    status,
    totalScenarios: 1,
    passedScenarios: 0,
    failedScenarios: 0,
    languages: ["en"],
    createdAt: "2026-11-22T08:00:00.000Z",
    startedAt: null,
    duration: null,
  };
}

describe("getTestRunStats", () => {
  it("should count the runs of each kind", () => {
    const stats = getTestRunStats([
      createTestRun("completed"),
      createTestRun("completed"),
      createTestRun("failed"),
      createTestRun("cancelled"),
      createTestRun("cancelled"),
      createTestRun("cancelled"),
      createTestRun("queued"),
      createTestRun("planning"),
      createTestRun("running"),
    ]);

    expect(stats).toEqual({
      totalRuns: 9,
      completedRuns: 2,
      failedRuns: 1,
      cancelledRuns: 3,
      inProgressRuns: 3,
    });
  });

  it("should give numbers that add up to the total", () => {
    const stats = getTestRunStats([
      createTestRun("completed"),
      createTestRun("failed"),
      createTestRun("cancelled"),
      createTestRun("running"),
    ]);

    expect(
      stats.completedRuns +
        stats.failedRuns +
        stats.cancelledRuns +
        stats.inProgressRuns,
    ).toBe(stats.totalRuns);
  });

  it("should give zeros when there are no runs", () => {
    expect(getTestRunStats([])).toEqual({
      totalRuns: 0,
      completedRuns: 0,
      failedRuns: 0,
      cancelledRuns: 0,
      inProgressRuns: 0,
    });
  });
});
