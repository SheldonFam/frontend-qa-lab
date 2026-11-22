import type {
  TestConfiguration,
  Viewport,
} from "../schemas/test-configuration.schema.js";
import type { TestScenario } from "../types/scenario.types.js";

import { fillRouteLanguage } from "./fill-route-language.js";

function createScenario(
  language: string,
  route: string,
  viewport: Viewport,
): TestScenario {
  return {
    id: crypto.randomUUID(),
    language,
    route,
    viewport,
    status: "pending",
  };
}

export function generateScenarios(
  configuration: TestConfiguration,
): TestScenario[] {
  const scenarios: TestScenario[] = [];

  for (const language of configuration.languages) {
    for (const route of configuration.routes) {
      for (const viewport of configuration.viewports) {
        scenarios.push(
          createScenario(
            language,
            fillRouteLanguage(route, language),
            viewport,
          ),
        );
      }
    }
  }

  return scenarios;
}
