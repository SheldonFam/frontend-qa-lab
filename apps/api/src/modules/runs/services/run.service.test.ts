import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Browser } from "playwright";

import { launchBrowser } from "../../../browser/browser-manager.js";

import { runRepository } from "../repositories/run.repository.js";

import type { TestConfiguration } from "../schemas/test-configuration.schema.js";
import type { ScenarioResult } from "../types/scenario.types.js";

import { runScenario } from "./scenario-runner.js";
import { createRun, executeRun } from "./run.service.js";

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

  it("should throw an error when run does not exist", async () => {
    await expect(executeRun("invalid-id", configuration)).rejects.toThrow(
      "Run not found",
    );
  });

  it("should execute scenarios and complete the run", async () => {
    // 1. Create a Run
    const run = createRun(configuration);

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

    // 4. Mock launchBrowser
    vi.mocked(launchBrowser).mockResolvedValue(browser);

    // 5. Mock runScenario
    vi.mocked(runScenario).mockResolvedValue(result);

    // 6. Execute Run
    await executeRun(run.id, configuration);

    // 7. Get updated Run
    const updatedRun = runRepository.findById(run.id);

    // 8. Verify Run status
    expect(updatedRun?.status).toBe("completed");

    // 9. Verify ScenarioResult was saved
    expect(updatedRun?.results).toEqual([result]);

    // 10. Verify Browser was launched
    expect(launchBrowser).toHaveBeenCalledOnce();

    // 11. Verify Scenario Runner was called
    expect(runScenario).toHaveBeenCalledOnce();

    // 12. Verify Browser was closed
    expect(browser.close).toHaveBeenCalledOnce();
  });

  it("should complete the run when a scenario fails", async () => {
    // 1. Create a Run
    const run = createRun(configuration);

    const scenario = run.scenarios[0]!;

    // 2. Create a mock Browser
    const browser = {
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;

    // 3. Create a failed ScenarioResult
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
    await executeRun(run.id, configuration);

    // 6. Get updated Run
    const updatedRun = runRepository.findById(run.id);

    // 7. Verify Run status
    expect(updatedRun?.status).toBe("completed");

    // 8. Verify ScenarioResult
    expect(updatedRun?.results).toEqual([result]);

    // 9. Verify Browser cleanup
    expect(browser.close).toHaveBeenCalledOnce();
  });

  it("should mark the run as failed when browser launch fails", async () => {
    // 1. Create a Run
    const run = createRun(configuration);

    // 2. Mock Browser launch failure
    vi.mocked(launchBrowser).mockRejectedValue(
      new Error("Browser launch failed"),
    );

    // 3. Execute Run and expect error
    await expect(executeRun(run.id, configuration)).rejects.toThrow(
      "Browser launch failed",
    );

    // 4. Get updated Run
    const updatedRun = runRepository.findById(run.id);

    // 5. Verify Run status
    expect(updatedRun?.status).toBe("failed");

    // 6. Verify completedAt
    expect(updatedRun?.completedAt).not.toBeNull();

    // 7. Verify Scenario Runner was not called
    expect(runScenario).not.toHaveBeenCalled();
  });

  it("should close browser when scenario execution throws an error", async () => {
    // 1. Create a Run
    const run = createRun(configuration);

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
    await expect(executeRun(run.id, configuration)).rejects.toThrow(
      "Unexpected execution error",
    );

    // 6. Get updated Run
    const updatedRun = runRepository.findById(run.id);

    // 7. Verify Run status
    expect(updatedRun?.status).toBe("failed");

    // 8. Verify Browser was closed
    expect(browser.close).toHaveBeenCalledOnce();
  });
});
