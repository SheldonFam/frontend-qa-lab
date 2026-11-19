import type { ApiTestRun } from "../../../types/api";
import type { TestRun } from "../types/test-run";
import { getScenarioCounts } from "./get-scenario-counts";

function getRunName(targetUrl: string): string {
  try {
    return new URL(targetUrl).hostname;
  } catch {
    return targetUrl;
  }
}

export function toTestRun(apiRun: ApiTestRun): TestRun {
  const scenarios = apiRun.scenarios;
  const counts = getScenarioCounts(scenarios);

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
    name: getRunName(apiRun.targetUrl),
    targetUrl: apiRun.targetUrl,
    status: apiRun.status,
    totalScenarios: counts.total,
    passedScenarios: counts.passed,
    failedScenarios: counts.failed,
    languages: [...new Set(scenarios.map((scenario) => scenario.language))],
    createdAt: apiRun.createdAt,
    startedAt: apiRun.startedAt,
    duration,
  };
}
