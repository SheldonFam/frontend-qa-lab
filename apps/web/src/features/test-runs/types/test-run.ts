export type TestRunStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface TestRun {
  id: string;
  name: string;
  targetUrl: string;

  status: TestRunStatus;

  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  skippedScenarios: number;

  languages: string[];

  createdAt: string;
  startedAt: string | null;

  duration: number | null;
}

export type TestRunStatusFilter = "all" | TestRunStatus;
