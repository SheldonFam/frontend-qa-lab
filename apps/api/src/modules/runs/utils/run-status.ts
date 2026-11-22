import type { RunStatus } from "../types/run.types.js";

export const UNFINISHED_RUN_STATUSES: RunStatus[] = [
  "queued",
  "planning",
  "running",
];

export function isRunFinished(status: RunStatus): boolean {
  return !UNFINISHED_RUN_STATUSES.includes(status);
}
