import { describe, expect, it } from "vitest";

import { buildAgentStep } from "./build-agent-step.js";

describe("buildAgentStep", () => {
  it("should build a step for a tool that ran", () => {
    const step = buildAgentStep(
      "click_element",
      {
        role: "button",
        name: "Login",
      },
      {
        success: true,
        data: {
          role: "button",
          name: "Login",
          clicked: true,
        },
        error: null,
      },
    );

    expect(step).toEqual({
      tool: "click_element",
      arguments: {
        role: "button",
        name: "Login",
      },
      success: true,
      passed: null,
      error: null,
    });
  });

  it("should keep whether an assertion passed or failed", () => {
    const passedStep = buildAgentStep(
      "assert_url",
      {
        expectedPath: "/",
      },
      {
        success: true,
        data: {
          passed: true,
        },
        error: null,
      },
    );

    const failedStep = buildAgentStep(
      "assert_url",
      {
        expectedPath: "/login",
      },
      {
        success: true,
        data: {
          passed: false,
        },
        error: null,
      },
    );

    expect(passedStep.passed).toBe(true);
    expect(failedStep.passed).toBe(false);
  });

  it("should keep the error message when a tool reports an error", () => {
    const step = buildAgentStep(
      "click_element",
      {
        role: "button",
        name: "Login",
      },
      {
        success: false,
        data: null,
        error: {
          code: "ELEMENT_NOT_FOUND",
          message: 'No button named "Login" was found',
        },
      },
    );

    expect(step).toEqual({
      tool: "click_element",
      arguments: {
        role: "button",
        name: "Login",
      },
      success: false,
      passed: null,
      error: 'No button named "Login" was found',
    });
  });
});
