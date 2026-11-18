import type { ApiRunStatus } from "../../../types/api";

export type TestRunStatus = ApiRunStatus;

export interface TestRun {
  id: string;
  name: string;
  targetUrl: string;

  status: TestRunStatus;

  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;

  languages: string[];

  createdAt: string;
  startedAt: string | null;

  duration: number | null;
}

export type TestRunStatusFilter = "all" | TestRunStatus;
