import type { TestScenario } from "../utils/generate-scenarios.js";

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
};
