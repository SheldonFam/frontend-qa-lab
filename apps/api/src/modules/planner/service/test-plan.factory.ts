import { randomUUID } from "node:crypto";
import type { TestPlan, TestPlanOutput } from "../schemas/test-plan.schema.js";

export function createTestPlan(output: TestPlanOutput): TestPlan {
  const testPlan = {
    id: randomUUID(),
    name: output.name,
    description: output.description,
    steps: output.steps.map((step) => ({
      ...step,
      id: randomUUID(),
    })),
  };
  return testPlan;
}
