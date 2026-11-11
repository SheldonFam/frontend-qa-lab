import type { LanguageCode } from "../constants/languages";
import type { TestConfiguration } from "../types/test-configuration";
import type { TestScenario } from "../types/test-scenario";
import type { Viewport } from "../types/viewport";

function createScenario(
  language: LanguageCode,
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
        scenarios.push(createScenario(language, route, viewport));
      }
    }
  }

  return scenarios;
}
