import type { ApiAgentStep } from "../../../types/api";

export interface StepOutcome {
  label: string;
  color: string;
}

export function getStepOutcome(step: ApiAgentStep): StepOutcome {
  if (!step.success) {
    return {
      label: "Error",
      color: "red",
    };
  }

  if (step.passed === true) {
    return {
      label: "Passed",
      color: "green",
    };
  }

  if (step.passed === false) {
    return {
      label: "Failed",
      color: "red",
    };
  }

  return {
    label: "Done",
    color: "gray",
  };
}
