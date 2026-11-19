import type { TestRun } from "../types/test-run";

export function formatDuration(testRun: TestRun): string {
  if (testRun.status === "queued") {
    return "Queued";
  }

  if (testRun.status === "running") {
    return "In progress";
  }

  if (testRun.duration === null) {
    return "—";
  }

  const minutes = Math.floor(testRun.duration / 60);
  const seconds = testRun.duration % 60;

  return `${minutes}m ${seconds}s`;
}
