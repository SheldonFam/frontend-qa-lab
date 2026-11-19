function toLabel(key: string): string {
  const words = key.replace(/([A-Z])/g, " $1").toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
}

function toText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

export function getAssertionDetails(message: string): string[] {
  let details: unknown;

  try {
    details = JSON.parse(message);
  } catch {
    return [message];
  }

  if (
    typeof details !== "object" ||
    details === null ||
    Array.isArray(details)
  ) {
    return [message];
  }

  return Object.entries(details)
    .filter(([key]) => key !== "passed")
    .map(([key, value]) => `${toLabel(key)}: ${toText(value)}`);
}
