import type { TestRun, TestRunStatus } from "../types/test-run";

export function getTestRunStats(testRuns: TestRun[]) {
  function countByStatus(status: TestRunStatus): number {
    return testRuns.filter((testRun) => testRun.status === status).length;
  }

  return {
    totalRuns: testRuns.length,
    completedRuns: countByStatus("completed"),
    failedRuns: countByStatus("failed"),
    inProgressRuns:
      countByStatus("queued") +
      countByStatus("planning") +
      countByStatus("running"),
  };
}
