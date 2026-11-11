import type { LanguageCode } from "../../test-configuration/constants/languages";

interface TestRunBase {
  id: string;
  name: string;
  targetUrl: string;
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  skippedScenarios: number;
  languages: LanguageCode[];
  startedAt: string;
}

// A running test has no duration yet; a finished one always has one.
interface RunningTestRun extends TestRunBase {
  status: "running";
  duration: null;
}

interface FinishedTestRun extends TestRunBase {
  status: "passed" | "failed";
  duration: number;
}

export type TestRun = RunningTestRun | FinishedTestRun;

export type TestRunStatus = TestRun["status"];

export type TestRunStatusFilter = "all" | TestRunStatus;
