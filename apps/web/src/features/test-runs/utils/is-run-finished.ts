import type { TestRunStatus } from "../types/test-run";

export function isRunFinished(status: TestRunStatus): boolean {
  return (
    status === "completed" || status === "failed" || status === "cancelled"
  );
}
