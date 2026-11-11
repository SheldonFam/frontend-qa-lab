import type {
  TestConfiguration,
  Viewport,
} from "../schemas/test-configuration.schema.js";

export type TestScenario = {
  id: string;
  language: string;
  route: string;
  viewport: Viewport;
  status: "pending";
};

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
        scenarios.push(createScenario(language, route, viewport));
      }
    }
  }

  return scenarios;
}
