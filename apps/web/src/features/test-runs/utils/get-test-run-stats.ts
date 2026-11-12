import type { TestRun, TestRunStatus } from "../types/test-run";

export function getTestRunStats(testRuns: TestRun[]) {
  const countByStatus = (status: TestRunStatus) =>
    testRuns.filter((testRun) => testRun.status === status).length;

  return {
    totalRuns: testRuns.length,
    completedRuns: countByStatus("completed"),
    failedRuns: countByStatus("failed"),
    runningRuns: countByStatus("running"),
  };
}
