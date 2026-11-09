export interface TestRun {
  id: string;
  name: string;
  targetUrl: string;
  status: "passed" | "failed" | "running";
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  skippedScenarios: number;
  languages: string[];
  startedAt: string;
  duration: number | null;
}
