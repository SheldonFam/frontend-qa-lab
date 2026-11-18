import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Browser } from "playwright";

import { launchBrowser } from "../../../browser/browser-manager.js";
import { runAgentScenario } from "../../agent/runtime/agent-scenario-runner.js";

import { runRepository } from "../repositories/run.repository.js";

import type { TestConfiguration } from "../schemas/test-configuration.schema.js";
import type { CreateRunInput } from "../schemas/create-run.schema.js";
import type { ScenarioResult } from "../types/scenario.types.js";

import { createRun, executeRun } from "./run.service.js";
import { mockLLMClient } from "../../planner/clients/mock-llm.client.js";

// Mock Browser Manager
vi.mock("../../../browser/browser-manager.js", () => ({
  launchBrowser: vi.fn(),
}));

// Mock Agent Scenario Runner
vi.mock("../../agent/runtime/agent-scenario-runner.js", () => ({
  runAgentScenario: vi.fn(),
}));

describe("executeRun", () => {
  beforeEach(() => {
    runRepository.clear();
    vi.clearAllMocks();
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
      screenshotPath: null,
    };

    vi.mocked(launchBrowser).mockResolvedValue(browser);
    vi.mocked(runAgentScenario).mockResolvedValue(result);

    await executeRun(run.id, input);

    const updatedRun = runRepository.findById(run.id);

    expect(updatedRun?.status).toBe("completed");

    expect(updatedRun?.testPlan).not.toBeNull();
    expect(updatedRun?.testPlan?.name).toBe("Login Functionality Test");

    expect(updatedRun?.results).toEqual([result]);
    expect(updatedRun?.scenarios[0]?.status).toBe("passed");

    expect(launchBrowser).toHaveBeenCalledOnce();
    expect(runAgentScenario).toHaveBeenCalledOnce();

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
});
