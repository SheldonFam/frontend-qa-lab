import type { ApiTestScenario } from "../../../types/api";

export function getScenarioCounts(scenarios: ApiTestScenario[]) {
  const passed = scenarios.filter(
    (scenario) => scenario.status === "passed",
  ).length;

  const failed = scenarios.filter(
    (scenario) => scenario.status === "failed",
  ).length;

  return {
    total: scenarios.length,
    passed,
    failed,
    completed: passed + failed,
  };
}
