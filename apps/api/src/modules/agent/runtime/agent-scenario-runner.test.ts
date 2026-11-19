import path from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Browser } from "playwright";

import type { TestPlan } from "../../planner/schemas/test-plan.schema.js";
import type { TestConfiguration } from "../../runs/schemas/test-configuration.schema.js";
import type { TestScenario } from "../../runs/types/scenario.types.js";

import { createAgentRuntime } from "./agent-runtime.js";
import { runAgentScenario } from "./agent-scenario-runner.js";

vi.mock("./agent-runtime.js", () => ({
  createAgentRuntime: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

type AgentRuntime = Awaited<ReturnType<typeof createAgentRuntime>>;

const browser = {} as Browser;

const configuration: TestConfiguration = {
  targetUrl: "https://example.com",
  languages: ["en"],
  routes: ["/"],
  viewports: [
    {
      name: "desktop",
      width: 1280,
      height: 720,
    },
  ],
};

const scenario: TestScenario = {
  id: "scenario-1",
  language: "en",
  route: "/",
  viewport: configuration.viewports[0]!,
  status: "pending",
};

const testPlan: TestPlan = {
  id: "plan-1",
  name: "Home page",
  description: "Check the home page.",
  steps: [],
};

const expectedScreenshotPath = path.join(
  "screenshots",
  "run-1",
  "scenario-1.png",
);

function createRuntime() {
  return {
    page: {
      goto: vi.fn().mockResolvedValue(null),
      screenshot: vi.fn().mockResolvedValue(undefined),
    },
    diagnostics: {
      consoleErrors: [],
      pageErrors: [],
      failedRequests: [],
    },
    runAgent: vi.fn(),
    executeTool: vi.fn().mockResolvedValue({
      success: false,
      data: null,
      error: {
        code: "INSPECTION_FAILED",
        message: "Inspection failed",
      },
    }),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

describe("runAgentScenario", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should save a screenshot and a short error when the AI step fails", async () => {
    const runtime = createRuntime();

    runtime.runAgent.mockRejectedValue(
      new Error("The AI service usage limit was reached. Try again later."),
    );

    vi.mocked(createAgentRuntime).mockResolvedValue(
      runtime as unknown as AgentRuntime,
    );

    const result = await runAgentScenario(
      browser,
      configuration,
      scenario,
      testPlan,
      "run-1",
    );

    expect(result.status).toBe("failed");
    expect(result.error).toBe(
      "The AI service usage limit was reached. Try again later.",
    );
    expect(result.screenshotPath).toBe(expectedScreenshotPath);
    expect(runtime.page.screenshot).toHaveBeenCalledTimes(1);
    expect(runtime.close).toHaveBeenCalledTimes(1);
  });

  it("should not take a screenshot when the page could not be opened", async () => {
    const runtime = createRuntime();

    runtime.page.goto.mockRejectedValue(
      new Error(
        "page.goto: net::ERR_NAME_NOT_RESOLVED at https://example.com/\nCall log:\n  \u001b[2m- navigating to the page\u001b[22m",
      ),
    );

    vi.mocked(createAgentRuntime).mockResolvedValue(
      runtime as unknown as AgentRuntime,
    );

    const result = await runAgentScenario(
      browser,
      configuration,
      scenario,
      testPlan,
      "run-1",
    );

    expect(result.status).toBe("failed");
    expect(result.error).toBe(
      "page.goto: net::ERR_NAME_NOT_RESOLVED at https://example.com/",
    );
    expect(result.screenshotPath).toBeNull();
    expect(runtime.page.screenshot).not.toHaveBeenCalled();
    expect(runtime.runAgent).not.toHaveBeenCalled();
  });

  it("should return a relative screenshot path when the scenario passes", async () => {
    const runtime = createRuntime();

    runtime.runAgent.mockResolvedValue({
      status: "completed",
      message: "Done",
      steps: 1,
      messages: [
        {
          role: "assistant",
          content: "",
          toolCalls: [
            {
              id: "call-1",
              name: "assert_url",
              arguments: {
                expectedPath: "/",
              },
            },
          ],
        },
        {
          role: "tool",
          toolCallId: "call-1",
          content: JSON.stringify({
            success: true,
            data: {
              expectedPath: "/",
              actualPath: "/",
              passed: true,
              reason: "URL_MATCHED",
            },
            error: null,
          }),
        },
      ],
    });

    vi.mocked(createAgentRuntime).mockResolvedValue(
      runtime as unknown as AgentRuntime,
    );

    const result = await runAgentScenario(
      browser,
      configuration,
      scenario,
      testPlan,
      "run-1",
    );

    expect(result.status).toBe("passed");
    expect(result.error).toBeNull();
    expect(result.screenshotPath).toBe(expectedScreenshotPath);
    expect(path.isAbsolute(expectedScreenshotPath)).toBe(false);
  });
});
