import { beforeEach, describe, expect, it, vi } from "vitest";

import { env } from "../../config/env.js";

import type { FailureAnalysisInput } from "./failure-analysis-prompt.js";
import { analyzeFailure } from "./failure-analysis.service.js";

const { create } = vi.hoisted(() => ({
  create: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class {
    responses = {
      create,
    };
  },
}));

vi.mock("../../config/env.js", () => ({
  env: {
    PLANNER_CLIENT: "openai",
    OPENAI_MODEL: "test-model",
  },
}));

const input: FailureAnalysisInput = {
  scenario: {
    id: "scenario-1",
    language: "en",
    route: "/login",
    viewport: {
      name: "Desktop",
      width: 1440,
      height: 900,
    },
    status: "pending",
  },
  testPlan: {
    id: "plan-1",
    name: "Login page",
    description: "Check the login form.",
    steps: [
      {
        id: "step-1",
        action: "assert_visible",
        target: "Login button",
      },
    ],
  },
  result: {
    scenarioId: "scenario-1",
    status: "failed",
    url: "https://example.com/login",
    title: "Login",
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    buttons: [],
    inputs: [],
    error: null,
    assertions: [
      {
        name: "assert_visible",
        passed: false,
        message: '{"role":"button","name":"Login","passed":false}',
      },
    ],
    agentSteps: [],
    agentSummary: null,
    failureAnalysis: null,
    screenshotPath: null,
  },
};

const analysis = {
  analysis: "The Login button was not visible on the page.",
  suggestedAction: "Check that the Login button is shown on the login page.",
};

describe("analyzeFailure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => {});

    env.PLANNER_CLIENT = "openai";
  });

  it("should ask the AI for JSON in the analysis schema", async () => {
    create.mockResolvedValue({
      status: "completed",
      output_text: JSON.stringify(analysis),
    });

    await analyzeFailure(input);

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "test-model",
        instructions: expect.stringContaining("frontend QA analyst"),
        input: expect.stringContaining("<scenario_result_json>"),
        text: {
          format: expect.objectContaining({
            type: "json_schema",
            name: "failure_analysis",
            strict: false,
            schema: expect.objectContaining({
              type: "object",
              required: ["analysis", "suggestedAction"],
            }),
          }),
        },
      }),
    );
  });

  it("should return the analysis that the AI wrote", async () => {
    create.mockResolvedValue({
      status: "completed",
      output_text: JSON.stringify(analysis),
    });

    await expect(analyzeFailure(input)).resolves.toEqual(analysis);
  });

  it("should return null when the AI request fails", async () => {
    create.mockRejectedValue(new Error("429 Rate limit reached"));

    await expect(analyzeFailure(input)).resolves.toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      "AI failure analysis was skipped: 429 Rate limit reached",
    );
  });

  it("should return null when the AI does not return JSON", async () => {
    create.mockResolvedValue({
      status: "completed",
      output_text: "Sorry, I cannot help with that.",
    });

    await expect(analyzeFailure(input)).resolves.toBeNull();
  });

  it("should return null when the AI returns the wrong fields", async () => {
    create.mockResolvedValue({
      status: "completed",
      output_text: JSON.stringify({
        analysis: "The Login button was not visible on the page.",
      }),
    });

    await expect(analyzeFailure(input)).resolves.toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      "AI failure analysis was skipped: The AI returned an analysis with the wrong fields",
    );
  });

  it("should return null when the response did not complete", async () => {
    create.mockResolvedValue({
      status: "incomplete",
      output_text: "",
    });

    await expect(analyzeFailure(input)).resolves.toBeNull();
  });

  it("should not call the AI when the planner runs in mock mode", async () => {
    env.PLANNER_CLIENT = "mock";

    await expect(analyzeFailure(input)).resolves.toBeNull();
    expect(create).not.toHaveBeenCalled();
  });
});
