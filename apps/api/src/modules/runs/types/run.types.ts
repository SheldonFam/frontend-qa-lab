import { ScenarioResult, TestScenario } from "./scenario.types.js";

export type RunStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type TestRun = {
  id: string;
  targetUrl: string;
  status: RunStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  scenarios: TestScenario[];
  results: ScenarioResult[];
};
