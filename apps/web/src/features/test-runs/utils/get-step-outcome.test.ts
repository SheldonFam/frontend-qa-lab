import { describe, expect, it } from "vitest";

import type { ApiAgentStep } from "../../../types/api";

import { getStepOutcome } from "./get-step-outcome";

function createStep(changes: Partial<ApiAgentStep>): ApiAgentStep {
  return {
    tool: "click_element",
    arguments: {},
    success: true,
    passed: null,
    error: null,
    ...changes,
  };
}

describe("getStepOutcome", () => {
  it("should say Done for a tool that ran and is not an assertion", () => {
    expect(getStepOutcome(createStep({}))).toEqual({
      label: "Done",
      color: "gray",
    });
  });

  it("should say Passed for an assertion that passed", () => {
    expect(getStepOutcome(createStep({ passed: true }))).toEqual({
      label: "Passed",
      color: "green",
    });
  });

  it("should say Failed for an assertion that did not pass", () => {
    expect(getStepOutcome(createStep({ passed: false }))).toEqual({
      label: "Failed",
      color: "red",
    });
  });

  it("should say Error for a tool that reported an error", () => {
    const step = createStep({
      success: false,
      error: 'No button named "Login" was found',
    });

    expect(getStepOutcome(step)).toEqual({
      label: "Error",
      color: "red",
    });
  });
});
