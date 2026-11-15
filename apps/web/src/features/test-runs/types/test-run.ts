export type TestRunStatus =
  | "queued"
  | "planning"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type TestPlanStep =
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

export interface TestPlan {
  id: string;
  name: string;
  description: string;
  steps: TestPlanStep[];
}

export interface TestRun {
  id: string;
  name: string;
  targetUrl: string;

  status: TestRunStatus;

  requirements: string;
  testPlan: TestPlan | null;

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
