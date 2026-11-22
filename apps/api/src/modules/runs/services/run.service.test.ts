import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Browser } from "playwright";

import { launchBrowser } from "../../../browser/browser-manager.js";
import { runAgentScenario } from "../../agent/runtime/agent-scenario-runner.js";
import { analyzeFailure } from "../../analysis/failure-analysis.service.js";

import { runRepository } from "../repositories/run.repository.js";

import type { TestConfiguration } from "../schemas/test-configuration.schema.js";
import type { CreateRunInput } from "../schemas/create-run.schema.js";
import type { ScenarioResult } from "../types/scenario.types.js";

import {
  cancelRun,
  createRun,
  executeRun,
  failUnfinishedRuns,
} from "./run.service.js";
import { mockLLMClient } from "../../planner/clients/mock-llm.client.js";

// Mock Browser Manager
vi.mock("../../../browser/browser-manager.js", () => ({
  launchBrowser: vi.fn(),
}));

// Mock Agent Scenario Runner
vi.mock("../../agent/runtime/agent-scenario-runner.js", () => ({
  runAgentScenario: vi.fn(),
}));

vi.mock("../../analysis/failure-analysis.service.js", () => ({
  analyzeFailure: vi.fn(),
}));

describe("executeRun", () => {
  beforeEach(() => {
    runRepository.clear();
    vi.clearAllMocks();
    vi.mocked(analyzeFailure).mockResolvedValue(null);
  });

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

  const input: CreateRunInput = {
    configuration,
    requirements: "Test login functionality",
  };

  it("should throw an error when run does not exist", async () => {
    await expect(executeRun("invalid-id", input)).rejects.toThrow(
      "Run not found",
    );
  });

  it("should execute scenarios and complete the run", async () => {
    const run = createRun(input);
    const scenario = run.scenarios[0]!;

    const browser = {
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;

    const result: ScenarioResult = {
      scenarioId: scenario.id,
      status: "passed",
      url: "https://example.com/",
      title: "Example Domain",
      consoleErrors: [],
      pageErrors: [],
      error: null,
      failedRequests: [],
      inputs: [],
      buttons: [],
      assertions: [],
      agentSteps: [],
      agentSummary: null,
      failureAnalysis: null,
      screenshotPath: null,
    };

    vi.mocked(launchBrowser).mockResolvedValue(browser);
    vi.mocked(runAgentScenario).mockResolvedValue(result);

    await executeRun(run.id, input);

    const updatedRun = runRepository.findById(run.id);

    expect(updatedRun?.status).toBe("completed");

    expect(updatedRun?.testPlan).not.toBeNull();
    expect(updatedRun?.testPlan?.name).toBe("Sample plan (mock planner)");

    expect(updatedRun?.results).toEqual([result]);
    expect(updatedRun?.scenarios[0]?.status).toBe("passed");

    expect(launchBrowser).toHaveBeenCalledOnce();
    expect(runAgentScenario).toHaveBeenCalledOnce();
    expect(analyzeFailure).not.toHaveBeenCalled();

    expect(browser.close).toHaveBeenCalledOnce();

    expect(updatedRun?.startedAt).not.toBeNull();
    expect(updatedRun?.completedAt).not.toBeNull();
  });

  it("should complete the run when a scenario fails", async () => {
    const run = createRun(input);
    const scenario = run.scenarios[0]!;

    const browser = {
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;

    const result: ScenarioResult = {
      scenarioId: scenario.id,
      status: "failed",
      url: "https://example.com/",
      title: "Example Domain",
      consoleErrors: [],
      pageErrors: [],
      error: "Login assertion failed",
      failedRequests: [],
      inputs: [],
      buttons: [],
      assertions: [],
      agentSteps: [],
      agentSummary: null,
      failureAnalysis: null,
      screenshotPath: null,
    };

    vi.mocked(launchBrowser).mockResolvedValue(browser);
    vi.mocked(runAgentScenario).mockResolvedValue(result);

    await executeRun(run.id, input);

    const updatedRun = runRepository.findById(run.id);

    // A failed scenario does not mean the entire Run execution failed.
    expect(updatedRun?.status).toBe("completed");

    expect(updatedRun?.scenarios[0]?.status).toBe("failed");
    expect(updatedRun?.results).toEqual([result]);

    expect(browser.close).toHaveBeenCalledOnce();
  });

  it("should save the AI analysis of a failed scenario", async () => {
    const run = createRun(input);
    const scenario = run.scenarios[0]!;

    const browser = {
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;

    const result: ScenarioResult = {
      scenarioId: scenario.id,
      status: "failed",
      url: "https://example.com/",
      title: "Example Domain",
      consoleErrors: [],
      pageErrors: [],
      error: "Login assertion failed",
      failedRequests: [],
      inputs: [],
      buttons: [],
      assertions: [],
      agentSteps: [],
      agentSummary: null,
      failureAnalysis: null,
      screenshotPath: null,
    };

    const failureAnalysis = {
      analysis: "The Login button was not visible on the page.",
      suggestedAction: "Check that the Login button is shown on the page.",
    };

    vi.mocked(launchBrowser).mockResolvedValue(browser);
    vi.mocked(runAgentScenario).mockResolvedValue(result);
    vi.mocked(analyzeFailure).mockResolvedValue(failureAnalysis);

    await executeRun(run.id, input);

    const updatedRun = runRepository.findById(run.id);

    expect(analyzeFailure).toHaveBeenCalledOnce();
    expect(analyzeFailure).toHaveBeenCalledWith({
      scenario,
      testPlan: expect.objectContaining({
        name: "Sample plan (mock planner)",
      }),
      result,
    });
    expect(updatedRun?.results[0]?.failureAnalysis).toEqual(failureAnalysis);
    expect(updatedRun?.scenarios[0]?.status).toBe("failed");
  });

  it("should mark the run as failed when browser launch fails", async () => {
    const run = createRun(input);

    vi.mocked(launchBrowser).mockRejectedValue(
      new Error("Browser launch failed"),
    );

    await expect(executeRun(run.id, input)).rejects.toThrow(
      "Browser launch failed",
    );

    const updatedRun = runRepository.findById(run.id);

    expect(updatedRun?.status).toBe("failed");
    expect(updatedRun?.testPlan).not.toBeNull();
    expect(updatedRun?.completedAt).not.toBeNull();

    expect(runAgentScenario).not.toHaveBeenCalled();
  });

  it("should close browser when scenario execution throws an error", async () => {
    const run = createRun(input);

    const browser = {
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;

    vi.mocked(launchBrowser).mockResolvedValue(browser);

    vi.mocked(runAgentScenario).mockRejectedValue(
      new Error("Unexpected execution error"),
    );

    await expect(executeRun(run.id, input)).rejects.toThrow(
      "Unexpected execution error",
    );

    const updatedRun = runRepository.findById(run.id);

    expect(updatedRun?.status).toBe("failed");
    expect(updatedRun?.testPlan).not.toBeNull();

    expect(browser.close).toHaveBeenCalledOnce();
  });

  it("should mark the run as failed when planner generation fails", async () => {
    vi.spyOn(mockLLMClient, "generate").mockRejectedValueOnce(
      new Error("Planner generation failed"),
    );

    const run = createRun(input);

    await expect(executeRun(run.id, input)).rejects.toThrow(
      "Planner generation failed",
    );

    const updatedRun = runRepository.findById(run.id);

    expect(updatedRun?.status).toBe("failed");
    expect(updatedRun?.testPlan).toBeNull();
    expect(updatedRun?.completedAt).not.toBeNull();

    expect(launchBrowser).not.toHaveBeenCalled();
    expect(runAgentScenario).not.toHaveBeenCalled();

    expect(updatedRun?.startedAt).not.toBeNull();
  });

  it("should pass scenario-specific test plans to the agent", async () => {
    const scopedInput: CreateRunInput = {
      configuration: {
        targetUrl: "https://example.com",
        languages: ["en", "ms"],
        routes: ["/login", "/dashboard"],
        viewports: [
          {
            name: "desktop",
            width: 1280,
            height: 720,
          },
        ],
      },
      requirements: "Test login and dashboard functionality",
    };

    const run = createRun(scopedInput);

    const browser = {
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;

    // Generate a TestPlan containing four scope types.
    vi.spyOn(mockLLMClient, "generate").mockResolvedValueOnce({
      name: "Scoped Test Plan",
      description: "Verify scenario-specific test steps",
      steps: [
        {
          action: "assert_visible",
          target: "global-header",
        },
        {
          action: "assert_visible",
          target: "login-form",
          scope: {
            routes: ["/login"],
          },
        },
        {
          action: "assert_visible",
          target: "english-banner",
          scope: {
            languages: ["en"],
          },
        },
        {
          action: "assert_visible",
          target: "ms-dashboard-banner",
          scope: {
            routes: ["/dashboard"],
            languages: ["ms"],
          },
        },
      ],
    });

    vi.mocked(launchBrowser).mockResolvedValue(browser);

    // Return a result for each scenario being executed.
    vi.mocked(runAgentScenario).mockImplementation(
      async (_browser, _configuration, scenario) => ({
        scenarioId: scenario.id,
        status: "passed",
        url: `https://example.com${scenario.route}`,
        title: "Example Domain",
        consoleErrors: [],
        pageErrors: [],
        failedRequests: [],
        buttons: [],
        inputs: [],
        error: null,
        assertions: [],
        agentSteps: [],
        agentSummary: null,
        failureAnalysis: null,
        screenshotPath: null,
      }),
    );

    await executeRun(run.id, scopedInput);

    const calls = vi.mocked(runAgentScenario).mock.calls;

    expect(calls).toHaveLength(4);

    // Find the TestPlan passed to the Agent for a specific scenario.
    const getTargets = (route: string, language: string) => {
      const call = calls.find(
        (call) => call[2].route === route && call[2].language === language,
      );

      expect(call).toBeDefined();

      return call![3].steps.map((step) => {
        switch (step.action) {
          case "navigate":
          case "click":
          case "fill":
          case "assert_visible":
          case "assert_text":
            return step.target;

          case "assert_url":
            return step.expectedResult;
        }
      });
    };

    // en + /login:
    // Global + route-specific + language-specific
    expect(getTargets("/login", "en")).toEqual([
      "global-header",
      "login-form",
      "english-banner",
    ]);

    // en + /dashboard:
    // Global + language-specific
    expect(getTargets("/dashboard", "en")).toEqual([
      "global-header",
      "english-banner",
    ]);

    // ms + /login:
    // Global + route-specific
    expect(getTargets("/login", "ms")).toEqual(["global-header", "login-form"]);

    // ms + /dashboard:
    // Global + route-specific + language-specific
    expect(getTargets("/dashboard", "ms")).toEqual([
      "global-header",
      "ms-dashboard-banner",
    ]);

    const updatedRun = runRepository.findById(run.id);

    expect(updatedRun?.status).toBe("completed");
    expect(updatedRun?.results).toHaveLength(4);
    expect(browser.close).toHaveBeenCalledOnce();
  });
});

describe("executeRun with a language marker in the route", () => {
  beforeEach(() => {
    runRepository.clear();
    vi.clearAllMocks();
    vi.mocked(analyzeFailure).mockResolvedValue(null);
  });

  it("should plan and run with the real route of each language", async () => {
    const markerInput: CreateRunInput = {
      configuration: {
        targetUrl: "https://example.com",
        languages: ["en", "ms"],
        routes: ["/{language}/login"],
        viewports: [
          {
            name: "desktop",
            width: 1280,
            height: 720,
          },
        ],
      },
      requirements: "Test the login page in both languages",
    };

    const run = createRun(markerInput);

    expect(run.scenarios.map((scenario) => scenario.route)).toEqual([
      "/en/login",
      "/ms/login",
    ]);

    const browser = {
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;

    const generatePlan = vi
      .spyOn(mockLLMClient, "generate")
      .mockResolvedValueOnce({
        name: "Login plan",
        description: "Check the login page in each language",
        steps: [
          {
            action: "assert_visible",
            target: "login-form",
          },
          {
            action: "assert_url",
            expectedResult: "/ms/login",
            scope: {
              routes: ["/ms/login"],
            },
          },
        ],
      });

    vi.mocked(launchBrowser).mockResolvedValue(browser);
    vi.mocked(runAgentScenario).mockImplementation(
      async (_browser, _configuration, scenario) => ({
        scenarioId: scenario.id,
        status: "passed",
        url: `https://example.com${scenario.route}`,
        title: "Example Domain",
        consoleErrors: [],
        pageErrors: [],
        failedRequests: [],
        buttons: [],
        inputs: [],
        error: null,
        assertions: [],
        agentSteps: [],
        agentSummary: null,
        failureAnalysis: null,
        screenshotPath: null,
      }),
    );

    await executeRun(run.id, markerInput);

    const plannerPrompt = JSON.stringify(generatePlan.mock.calls[0]);

    expect(plannerPrompt).toContain("/en/login");
    expect(plannerPrompt).toContain("/ms/login");
    expect(plannerPrompt).not.toContain("{language}");

    const stepCountByRoute = Object.fromEntries(
      vi
        .mocked(runAgentScenario)
        .mock.calls.map((call) => [call[2].route, call[3].steps.length]),
    );

    expect(stepCountByRoute).toEqual({
      "/en/login": 1,
      "/ms/login": 2,
    });

    expect(runRepository.findById(run.id)?.status).toBe("completed");
  });
});

describe("executeRun failure reason", () => {
  beforeEach(() => {
    runRepository.clear();
    vi.clearAllMocks();
    vi.mocked(analyzeFailure).mockResolvedValue(null);
  });

  const input: CreateRunInput = {
    configuration: {
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
    },
    requirements: "Test login functionality",
  };

  it("should start a run without an error", () => {
    const run = createRun(input);

    expect(run.error).toBeNull();
  });

  it("should save a short reason when the run fails", async () => {
    vi.spyOn(mockLLMClient, "generate").mockRejectedValueOnce(
      new Error(
        "Planner generation failed\nCall log:\n  \u001b[2m- details\u001b[22m",
      ),
    );

    const run = createRun(input);

    await expect(executeRun(run.id, input)).rejects.toThrow(
      "Planner generation failed",
    );

    const updatedRun = runRepository.findById(run.id);

    expect(updatedRun?.status).toBe("failed");
    expect(updatedRun?.error).toBe("Planner generation failed");
  });
});

describe("failUnfinishedRuns", () => {
  beforeEach(() => {
    runRepository.clear();
  });

  it("should mark a run that never finished as failed", () => {
    const run = createRun({
      configuration: {
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
      },
      requirements: "Test login functionality",
    });

    failUnfinishedRuns();

    const updatedRun = runRepository.findById(run.id);

    expect(updatedRun?.status).toBe("failed");
    expect(updatedRun?.error).toBe(
      "The API restarted before this run finished.",
    );
    expect(updatedRun?.completedAt).not.toBeNull();
  });
});

describe("cancelRun", () => {
  beforeEach(() => {
    runRepository.clear();
  });

  it("should mark the run as cancelled", () => {
    const run = createRun({
      configuration: {
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
      },
      requirements: "Test login functionality",
    });

    const cancelledRun = cancelRun(run);

    expect(cancelledRun.status).toBe("cancelled");
    expect(cancelledRun.completedAt).not.toBeNull();
    expect(runRepository.findById(run.id)).toEqual(cancelledRun);
  });
});

describe("executeRun when the run is cancelled", () => {
  beforeEach(() => {
    runRepository.clear();
    vi.clearAllMocks();
    vi.mocked(analyzeFailure).mockResolvedValue(null);
  });

  const input: CreateRunInput = {
    configuration: {
      targetUrl: "https://example.com",
      languages: ["en"],
      routes: ["/login", "/dashboard"],
      viewports: [
        {
          name: "desktop",
          width: 1280,
          height: 720,
        },
      ],
    },
    requirements: "Test login and dashboard functionality",
  };

  function createResult(
    scenarioId: string,
    status: ScenarioResult["status"],
  ): ScenarioResult {
    return {
      scenarioId,
      status,
      url: "https://example.com/",
      title: "Example Domain",
      consoleErrors: [],
      pageErrors: [],
      error: status === "failed" ? "Login assertion failed" : null,
      failedRequests: [],
      inputs: [],
      buttons: [],
      assertions: [],
      agentSteps: [],
      agentSummary: null,
      failureAnalysis: null,
      screenshotPath: null,
    };
  }

  function createBrowser(): Browser {
    return {
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;
  }

  it("should stop before the browser starts when cancelled during planning", async () => {
    const run = createRun(input);
    const abortController = new AbortController();

    vi.spyOn(mockLLMClient, "generate").mockImplementationOnce(async () => {
      cancelRun(run);
      abortController.abort();

      return {
        name: "Login plan",
        description: "Check the login page",
        steps: [
          {
            action: "assert_visible",
            target: "login-form",
          },
        ],
      };
    });

    await executeRun(run.id, input, { signal: abortController.signal });

    const updatedRun = runRepository.findById(run.id);

    expect(updatedRun?.status).toBe("cancelled");
    expect(updatedRun?.testPlan).toBeNull();
    expect(updatedRun?.error).toBeNull();
    expect(launchBrowser).not.toHaveBeenCalled();
    expect(runAgentScenario).not.toHaveBeenCalled();
  });

  it("should not save the scenario that was running when the run was cancelled", async () => {
    const run = createRun(input);
    const browser = createBrowser();
    const abortController = new AbortController();

    vi.mocked(launchBrowser).mockResolvedValue(browser);
    vi.mocked(runAgentScenario).mockImplementation(
      async (_browser, _configuration, scenario) => {
        cancelRun(run);
        abortController.abort();

        return createResult(scenario.id, "failed");
      },
    );

    await executeRun(run.id, input, { signal: abortController.signal });

    const updatedRun = runRepository.findById(run.id);

    expect(updatedRun?.status).toBe("cancelled");
    expect(updatedRun?.results).toEqual([]);
    expect(updatedRun?.scenarios.map((scenario) => scenario.status)).toEqual([
      "pending",
      "pending",
    ]);
    expect(runAgentScenario).toHaveBeenCalledOnce();
    expect(analyzeFailure).not.toHaveBeenCalled();
    expect(browser.close).toHaveBeenCalledOnce();
  });

  it("should keep the results that were saved before the cancel", async () => {
    const run = createRun(input);
    const browser = createBrowser();
    const abortController = new AbortController();

    vi.mocked(launchBrowser).mockResolvedValue(browser);
    vi.mocked(runAgentScenario)
      .mockImplementationOnce(async (_browser, _configuration, scenario) =>
        createResult(scenario.id, "passed"),
      )
      .mockImplementationOnce(async (_browser, _configuration, scenario) => {
        cancelRun(run);
        abortController.abort();

        return createResult(scenario.id, "passed");
      });

    await executeRun(run.id, input, { signal: abortController.signal });

    const updatedRun = runRepository.findById(run.id);

    expect(updatedRun?.status).toBe("cancelled");
    expect(updatedRun?.results).toHaveLength(1);
    expect(updatedRun?.scenarios.map((scenario) => scenario.status)).toEqual([
      "passed",
      "pending",
    ]);
    expect(browser.close).toHaveBeenCalledOnce();
  });

  it("should not save a result when cancelled during the AI analysis", async () => {
    const run = createRun(input);
    const browser = createBrowser();
    const abortController = new AbortController();

    vi.mocked(launchBrowser).mockResolvedValue(browser);
    vi.mocked(runAgentScenario).mockImplementation(
      async (_browser, _configuration, scenario) =>
        createResult(scenario.id, "failed"),
    );
    vi.mocked(analyzeFailure).mockImplementationOnce(async () => {
      cancelRun(run);
      abortController.abort();

      return null;
    });

    await executeRun(run.id, input, { signal: abortController.signal });

    const updatedRun = runRepository.findById(run.id);

    expect(updatedRun?.status).toBe("cancelled");
    expect(updatedRun?.results).toEqual([]);
    expect(runAgentScenario).toHaveBeenCalledOnce();
  });

  it("should stay cancelled when the running scenario throws an error", async () => {
    const run = createRun(input);
    const browser = createBrowser();
    const abortController = new AbortController();

    vi.mocked(launchBrowser).mockResolvedValue(browser);
    vi.mocked(runAgentScenario).mockImplementation(async () => {
      cancelRun(run);
      abortController.abort();

      throw new Error("Unexpected execution error");
    });

    await executeRun(run.id, input, { signal: abortController.signal });

    const updatedRun = runRepository.findById(run.id);

    expect(updatedRun?.status).toBe("cancelled");
    expect(updatedRun?.error).toBeNull();
    expect(browser.close).toHaveBeenCalledOnce();
  });

  it("should still mark the run as failed when it was not cancelled", async () => {
    const run = createRun(input);
    const abortController = new AbortController();

    vi.mocked(launchBrowser).mockRejectedValue(
      new Error("Browser launch failed"),
    );

    await expect(
      executeRun(run.id, input, { signal: abortController.signal }),
    ).rejects.toThrow("Browser launch failed");

    expect(runRepository.findById(run.id)?.status).toBe("failed");
  });
});
