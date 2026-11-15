import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Browser } from "playwright";

import { launchBrowser } from "../../../browser/browser-manager.js";

import { runRepository } from "../repositories/run.repository.js";

import type { TestConfiguration } from "../schemas/test-configuration.schema.js";
import type { CreateRunInput } from "../schemas/create-run.schema.js";
import type { ScenarioResult } from "../types/scenario.types.js";

import { runScenario } from "./scenario-runner.js";
import { createRun, executeRun } from "./run.service.js";
import { mockLLMClient } from "../../planner/clients/mock-llm.client.js";

// Mock Browser Manager
vi.mock("../../../browser/browser-manager.js", () => ({
  launchBrowser: vi.fn(),
}));

// Mock Scenario Runner
vi.mock("./scenario-runner.js", () => ({
  runScenario: vi.fn(),
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
    // 1. Create a Run
    const run = createRun(input);

    const scenario = run.scenarios[0]!;

    // 2. Create a mock Browser
    const browser = {
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;

    // 3. Create a mock ScenarioResult
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

    // 4. Mock dependencies
    vi.mocked(launchBrowser).mockResolvedValue(browser);
    vi.mocked(runScenario).mockResolvedValue(result);

    // 5. Execute Run
    await executeRun(run.id, input);

    // 6. Get updated Run
    const updatedRun = runRepository.findById(run.id);

    // 7. Verify Run status
    expect(updatedRun?.status).toBe("completed");

    // 8. Verify generated TestPlan was saved
    expect(updatedRun?.testPlan).not.toBeNull();
    expect(updatedRun?.testPlan?.name).toBe("Login Functionality Test");

    // 9. Verify ScenarioResult was saved
    expect(updatedRun?.results).toEqual([result]);

    // 10. Verify Scenario status
    expect(updatedRun?.scenarios[0]?.status).toBe("passed");

    // 11. Verify Browser was launched
    expect(launchBrowser).toHaveBeenCalledOnce();

    // 12. Verify Scenario Runner was called
    expect(runScenario).toHaveBeenCalledOnce();

    // 13. Verify Browser was closed
    expect(browser.close).toHaveBeenCalledOnce();

    expect(updatedRun?.startedAt).not.toBeNull();

    expect(updatedRun?.completedAt).not.toBeNull();
  });

  it("should complete the run when a scenario fails", async () => {
    // 1. Create a Run
    const run = createRun(input);

    const scenario = run.scenarios[0]!;

    // 2. Create a mock Browser
    const browser = {
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;

    // 3. Create a failed ScenarioResult
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

    // 4. Mock dependencies
    vi.mocked(launchBrowser).mockResolvedValue(browser);
    vi.mocked(runScenario).mockResolvedValue(result);

    // 5. Execute Run
    await executeRun(run.id, input);

    // 6. Get updated Run
    const updatedRun = runRepository.findById(run.id);

    // 7. Verify Run status
    // A failed scenario does not mean the entire Run execution failed.
    expect(updatedRun?.status).toBe("completed");

    // 8. Verify Scenario status
    expect(updatedRun?.scenarios[0]?.status).toBe("failed");

    // 9. Verify ScenarioResult
    expect(updatedRun?.results).toEqual([result]);

    // 10. Verify Browser cleanup
    expect(browser.close).toHaveBeenCalledOnce();
  });

  it("should mark the run as failed when browser launch fails", async () => {
    // 1. Create a Run
    const run = createRun(input);

    // 2. Mock Browser launch failure
    vi.mocked(launchBrowser).mockRejectedValue(
      new Error("Browser launch failed"),
    );

    // 3. Execute Run and expect error
    await expect(executeRun(run.id, input)).rejects.toThrow(
      "Browser launch failed",
    );

    // 4. Get updated Run
    const updatedRun = runRepository.findById(run.id);

    // 5. Verify Run status
    expect(updatedRun?.status).toBe("failed");

    // 6. Verify TestPlan was generated before browser launch
    expect(updatedRun?.testPlan).not.toBeNull();

    // 7. Verify completedAt
    expect(updatedRun?.completedAt).not.toBeNull();

    // 8. Verify Scenario Runner was not called
    expect(runScenario).not.toHaveBeenCalled();
  });

  it("should close browser when scenario execution throws an error", async () => {
    // 1. Create a Run
    const run = createRun(input);

    // 2. Create a mock Browser
    const browser = {
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;

    // 3. Mock Browser launch successfully
    vi.mocked(launchBrowser).mockResolvedValue(browser);

    // 4. Mock Scenario execution failure
    vi.mocked(runScenario).mockRejectedValue(
      new Error("Unexpected execution error"),
    );

    // 5. Execute Run and expect error
    await expect(executeRun(run.id, input)).rejects.toThrow(
      "Unexpected execution error",
    );

    // 6. Get updated Run
    const updatedRun = runRepository.findById(run.id);

    // 7. Verify Run status
    expect(updatedRun?.status).toBe("failed");

    // 8. Verify TestPlan was saved
    expect(updatedRun?.testPlan).not.toBeNull();

    // 9. Verify Browser was closed
    expect(browser.close).toHaveBeenCalledOnce();
  });

  it("should mark the run as failed when planner generation fails", async () => {
    // 1. Create a Run
    const run = createRun(input);

    // 2. Mock Planner failure
    vi.spyOn(mockLLMClient, "generate").mockRejectedValueOnce(
      new Error("Planner generation failed"),
    );

    // 3. Execute Run and expect error
    await expect(executeRun(run.id, input)).rejects.toThrow(
      "Planner generation failed",
    );

    // 4. Get updated Run
    const updatedRun = runRepository.findById(run.id);

    // 5. Verify Run status
    expect(updatedRun?.status).toBe("failed");

    // 6. Verify TestPlan was not generated
    expect(updatedRun?.testPlan).toBeNull();

    // 7. Verify completedAt
    expect(updatedRun?.completedAt).not.toBeNull();

    // 8. Verify Browser was not launched
    expect(launchBrowser).not.toHaveBeenCalled();

    // 9. Verify Scenario Runner was not called
    expect(runScenario).not.toHaveBeenCalled();

    // Verify Run start time
    expect(updatedRun?.startedAt).not.toBeNull();

    // Verify Run completion time
    expect(updatedRun?.completedAt).not.toBeNull();

    // Verify TestPlan was not generated
    expect(updatedRun?.testPlan).toBeNull();
  });
});
