export type ApiRunStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type ApiScenarioStatus = "pending" | "passed" | "failed";

export interface ApiViewport {
  name: string;
  width: number;
  height: number;
}

export interface ApiTestScenario {
  id: string;
  language: string;
  route: string;
  viewport: ApiViewport;
  status: ApiScenarioStatus;
}

export interface ApiScenarioResult {
  scenarioId: string;
  status: "passed" | "failed";
  url: string;
  title: string | null;
  error: string | null;
}

export interface ApiTestRun {
  id: string;
  targetUrl: string;
  status: ApiRunStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  scenarios: ApiTestScenario[];
  results: ApiScenarioResult[];
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
