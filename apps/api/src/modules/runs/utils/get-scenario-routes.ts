import type { TestScenario } from "../types/scenario.types.js";

export function getScenarioRoutes(scenarios: TestScenario[]): string[] {
  const routes: string[] = [];

  for (const scenario of scenarios) {
    if (!routes.includes(scenario.route)) {
      routes.push(scenario.route);
    }
  }

  return routes;
}
