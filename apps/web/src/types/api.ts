// Run Status
export type ApiRunStatus =
  | "queued"
  | "planning"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

// Scenario Status
export type ApiScenarioStatus = "pending" | "passed" | "failed";

// Viewport
export interface ApiViewport {
  name: string;
  width: number;
  height: number;
}

// Test Scenario
export interface ApiTestScenario {
  id: string;
  language: string;
  route: string;
  viewport: ApiViewport;
  status: ApiScenarioStatus;
}

// Scenario Result
export interface ApiScenarioResult {
  scenarioId: string;
  status: "passed" | "failed";
  url: string;
  title: string | null;
  error: string | null;
}

// Test Plan Step
export type ApiTestPlanStep =
  | {
      id: string;
      action: "navigate";
      target: string;
    }
  | {
      id: string;
      action: "click";
      target: string;
    }
  | {
      id: string;
      action: "fill";
      target: string;
      value: string;
    }
  | {
      id: string;
      action: "assert_visible";
      target: string;
    }
  | {
      id: string;
      action: "assert_text";
      target: string;
      expectedResult: string;
    }
  | {
      id: string;
      action: "assert_url";
      expectedResult: string;
    };

// Test Plan
export interface ApiTestPlan {
  id: string;
  name: string;
  description: string;
  steps: ApiTestPlanStep[];
}

// Test Configuration
export interface ApiTestConfiguration {
  targetUrl: string;
  languages: string[];
  routes: string[];
  viewports: ApiViewport[];
}

// Create Run Request
export interface ApiCreateTestRunInput {
  configuration: ApiTestConfiguration;
  requirements: string;
}

// Test Run
export interface ApiTestRun {
  id: string;
  targetUrl: string;
  status: ApiRunStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  requirements: string;
  testPlan: ApiTestPlan | null;
  scenarios: ApiTestScenario[];
  results: ApiScenarioResult[];
}

// API Responses
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
