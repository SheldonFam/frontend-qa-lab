import { stripVTControlCharacters } from "node:util";

const MAX_SUMMARY_LENGTH = 300;

export function getErrorSummary(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const firstLine = stripVTControlCharacters(message).split("\n")[0];
  const summary = firstLine.trim().slice(0, MAX_SUMMARY_LENGTH);

  return summary.length > 0 ? summary : "Unknown error";
}
