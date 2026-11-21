import { toLabel, toText } from "./get-assertion-details";

export function getStepDetails(stepArguments: unknown): string[] {
  if (
    typeof stepArguments !== "object" ||
    stepArguments === null ||
    Array.isArray(stepArguments)
  ) {
    return [];
  }

  return Object.entries(stepArguments).map(
    ([key, value]) => `${toLabel(key)}: ${toText(value)}`,
  );
}
