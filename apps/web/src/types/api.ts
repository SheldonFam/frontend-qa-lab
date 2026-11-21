// Run Status
export type ApiRunStatus =
  "queued" | "planning" | "running" | "completed" | "failed" | "cancelled";

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

// Assertion Result
export interface ApiAssertionResult {
  name: string;
  passed: boolean;
  message: string;
}

// Button Diagnostic
export interface ApiButtonDiagnostic {
  text: string;
  disabled: boolean;
}

// Input Diagnostic
export interface ApiInputDiagnostic {
  type: string;
  name: string | null;
  placeholder: string | null;
  disabled: boolean;
}

export interface ApiAgentStep {
  tool: string;
  arguments: unknown;
  success: boolean;
  passed: boolean | null;
  error: string | null;
}

export interface ApiFailureAnalysis {
  analysis: string;
  suggestedAction: string;
}

// Scenario Result
export interface ApiScenarioResult {
  scenarioId: string;
  status: "passed" | "failed";
  url: string;
  title: string | null;

  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];

  buttons: ApiButtonDiagnostic[];
  inputs: ApiInputDiagnostic[];

  error: string | null;
  assertions: ApiAssertionResult[];
  agentSteps: ApiAgentStep[];
  agentSummary: string | null;
  failureAnalysis: ApiFailureAnalysis | null;
  screenshotPath: string | null;
}

// Test Plan Step Scope
export interface ApiTestPlanStepScope {
  routes?: string[];
  languages?: string[];
}

// Common Test Plan Step Fields
interface ApiTestPlanStepBase {
  id: string;
  scope?: ApiTestPlanStepScope;
}

// Test Plan Step
export type ApiTestPlanStep =
  | (ApiTestPlanStepBase & {
      action: "navigate";
      target: string;
    })
  | (ApiTestPlanStepBase & {
      action: "click";
      target: string;
    })
  | (ApiTestPlanStepBase & {
      action: "fill";
      target: string;
      value: string;
    })
  | (ApiTestPlanStepBase & {
      action: "assert_visible";
      target: string;
    })
  | (ApiTestPlanStepBase & {
      action: "assert_text";
      target: string;
      expectedResult: string;
    })
  | (ApiTestPlanStepBase & {
      action: "assert_url";
      expectedResult: string;
    });

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
  error: string | null;
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
