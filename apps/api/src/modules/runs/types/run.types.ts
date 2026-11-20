import type { TestPlan } from "../../planner/schemas/test-plan.schema.js";
import type { ScenarioResult, TestScenario } from "./scenario.types.js";

export type RunStatus =
  "queued" | "running" | "completed" | "failed" | "cancelled" | "planning";

export type TestRun = {
  id: string;
  targetUrl: string;
  status: RunStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  scenarios: TestScenario[];
  results: ScenarioResult[];
  requirements: string;
  testPlan: TestPlan | null;
  error: string | null;
};
