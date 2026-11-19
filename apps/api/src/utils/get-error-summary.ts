const MAX_SUMMARY_LENGTH = 300;

const ANSI_CODES = /\u001b\[[0-9;]*m/g;

export function getErrorSummary(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const firstLine = message.replace(ANSI_CODES, "").split("\n")[0];
  const summary = firstLine.trim().slice(0, MAX_SUMMARY_LENGTH);

  return summary.length > 0 ? summary : "Unknown error";
}
