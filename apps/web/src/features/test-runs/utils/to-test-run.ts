import type { ApiTestRun } from "../types/test-run-api";
import type { TestRun } from "../types/test-run";

export function toTestRun(apiRun: ApiTestRun): TestRun {
  const scenarios = apiRun.scenarios;

  const passedScenarios = scenarios.filter(
    (scenario) => scenario.status === "passed",
  ).length;

  const failedScenarios = scenarios.filter(
    (scenario) => scenario.status === "failed",
  ).length;

  // Convert Backend "completed" into UI "passed" or "failed"
  const status: TestRun["status"] = apiRun.status;

  // Calculate execution duration in seconds
  const duration =
    apiRun.startedAt && apiRun.completedAt
      ? Math.round(
          (new Date(apiRun.completedAt).getTime() -
            new Date(apiRun.startedAt).getTime()) /
            1000,
        )
      : null;

  return {
    id: apiRun.id,
    name: new URL(apiRun.targetUrl).hostname,
    targetUrl: apiRun.targetUrl,
    status,
    totalScenarios: scenarios.length,
    passedScenarios,
    failedScenarios,
    skippedScenarios: 0,
    languages: [...new Set(scenarios.map((scenario) => scenario.language))],
    createdAt: apiRun.createdAt,
    startedAt: apiRun.startedAt,
    duration,
  };
}
