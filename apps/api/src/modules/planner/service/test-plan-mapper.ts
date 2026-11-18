import type { TestPlan } from "../schemas/test-plan.schema.js";
import type { TestScenario } from "../../runs/types/scenario.types.js";

export function mapTestPlanToScenario(
  testPlan: TestPlan,
  scenario: TestScenario,
): TestPlan {
  const steps = testPlan.steps.filter((step) => {
    const scope = step.scope;

    // No scope means the step applies to every scenario.
    if (!scope) {
      return true;
    }

    // A specified route must match the current scenario.
    const routeMatches = !scope.routes || scope.routes.includes(scenario.route);

    // A specified language must match the current scenario.
    const languageMatches =
      !scope.languages || scope.languages.includes(scenario.language);

    // All specified conditions must match.
    return routeMatches && languageMatches;
  });

  return {
    ...testPlan,
    steps,
  };
}
