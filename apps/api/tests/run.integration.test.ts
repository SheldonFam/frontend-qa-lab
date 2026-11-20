import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { Server } from "node:http";
import type { Browser } from "playwright";

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import app from "../src/app.js";

import { launchBrowser } from "../src/browser/browser-manager.js";
import { runAgentScenario } from "../src/modules/agent/runtime/agent-scenario-runner.js";
import { runRepository } from "../src/modules/runs/repositories/run.repository.js";
import type { TestRun } from "../src/modules/runs/types/run.types.js";
import type { ScenarioResult } from "../src/modules/runs/types/scenario.types.js";

// Mock Browser Manager
vi.mock("../src/browser/browser-manager.js", () => ({
  launchBrowser: vi.fn(),
}));

// Mock Agent Scenario Runner
vi.mock("../src/modules/agent/runtime/agent-scenario-runner.js", () => ({
  runAgentScenario: vi.fn(),
}));

describe("Runs API Integration", () => {
  let server: Server;
  let baseUrl: string;

  function createTestRun(runId: string): TestRun {
    return {
      id: runId,
      targetUrl: "https://example.com",
      status: "completed",
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      scenarios: [],
      results: [],
      requirements: "Test screenshot API",
      testPlan: null,
      error: null,
    };
  }

  function createScreenshotResult(
    scenarioId: string,
    screenshotPath: string | null,
  ): ScenarioResult {
    return {
      scenarioId,
      status: "passed",
      url: "https://example.com",
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
      screenshotPath,
    };
  }

  beforeAll(async () => {
    server = app.listen(0);

    await new Promise<void>((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });

    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Unable to get server address");
    }

    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  });

  beforeEach(() => {
    runRepository.clear();
    vi.resetAllMocks();
  });

  it("should return 400 when configuration is invalid", async () => {
    const invalidInput = {
      configuration: {
        targetUrl: "invalid-url",
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

    const response = await fetch(`${baseUrl}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invalidInput),
    });

    const body = await response.json();

    expect(response.status).toBe(400);

    expect(body).toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid run input",
      },
    });

    expect(launchBrowser).not.toHaveBeenCalled();
    expect(runAgentScenario).not.toHaveBeenCalled();
    expect(runRepository.findAll()).toHaveLength(0);
  });

  it("should create a run and execute it in the background", async () => {
    const configuration = {
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

    const input = {
      configuration,
      requirements: "Test login functionality",
    };

    const browser = {
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;

    vi.mocked(launchBrowser).mockResolvedValue(browser);

    vi.mocked(runAgentScenario).mockImplementation(
      async (_browser, config, scenario) => ({
        scenarioId: scenario.id,
        status: "passed",
        url: new URL(scenario.route, config.targetUrl).toString(),
        title: "Example Domain",
        error: null,
        inputs: [],
        buttons: [],
        consoleErrors: [],
        pageErrors: [],
        failedRequests: [],
        assertions: [
          {
            name: "assert_visible",
            passed: true,
            message: "Login button is visible",
          },
        ],
        agentSteps: [],
        agentSummary: null,
        failureAnalysis: null,
        screenshotPath: null,
      }),
    );

    const response = await fetch(`${baseUrl}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const body = await response.json();

    expect(response.status).toBe(202);

    expect(body).toMatchObject({
      success: true,
      data: {
        status: "queued",
        targetUrl: configuration.targetUrl,
        requirements: input.requirements,
        testPlan: null,
        error: null,
      },
    });

    const runId = body.data.id;

    await vi.waitFor(() => {
      expect(runRepository.findById(runId)?.status).toBe("completed");
    });

    const getResponse = await fetch(`${baseUrl}/runs/${runId}`);
    const getBody = await getResponse.json();

    expect(getResponse.status).toBe(200);

    expect(getBody.data.status).toBe("completed");
    expect(getBody.data.requirements).toBe(input.requirements);

    expect(getBody.data.testPlan).not.toBeNull();
    expect(getBody.data.testPlan.name).toBe("Sample plan (mock planner)");

    expect(getBody.data.results).toHaveLength(1);
    expect(getBody.data.results[0].status).toBe("passed");

    expect(launchBrowser).toHaveBeenCalledOnce();
    expect(runAgentScenario).toHaveBeenCalledOnce();
    expect(browser.close).toHaveBeenCalledOnce();
  });

  it("should keep a second run queued until the first run is finished", async () => {
    const input = {
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

    const browser = {
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;

    vi.mocked(launchBrowser).mockResolvedValue(browser);

    let finishFirstScenario: () => void = () => {};

    const firstScenarioIsFinished = new Promise<void>((resolve) => {
      finishFirstScenario = resolve;
    });

    vi.mocked(runAgentScenario)
      .mockImplementationOnce(async (_browser, _config, scenario) => {
        await firstScenarioIsFinished;

        return createScreenshotResult(scenario.id, null);
      })
      .mockImplementation(async (_browser, _config, scenario) =>
        createScreenshotResult(scenario.id, null),
      );

    async function startRun(): Promise<string> {
      const response = await fetch(`${baseUrl}/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const body = await response.json();

      expect(response.status).toBe(202);

      return body.data.id;
    }

    const firstRunId = await startRun();
    const secondRunId = await startRun();

    await vi.waitFor(() => {
      expect(runRepository.findById(firstRunId)?.status).toBe("running");
    });

    expect(runRepository.findById(secondRunId)?.status).toBe("queued");
    expect(runAgentScenario).toHaveBeenCalledTimes(1);

    finishFirstScenario();

    await vi.waitFor(() => {
      expect(runRepository.findById(firstRunId)?.status).toBe("completed");
      expect(runRepository.findById(secondRunId)?.status).toBe("completed");
    });

    expect(runAgentScenario).toHaveBeenCalledTimes(2);
  });

  it("should return a screenshot when it exists", async () => {
    const runId = `screenshot-test-${Date.now()}`;
    const scenarioId = "scenario-1";

    const screenshotPath = path.join(
      process.cwd(),
      "screenshots",
      runId,
      `${scenarioId}.png`,
    );

    // Minimal PNG signature for testing the file response
    const screenshotBuffer = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    await mkdir(path.dirname(screenshotPath), { recursive: true });
    await writeFile(screenshotPath, screenshotBuffer);

    try {
      const testRun = createTestRun(runId);

      testRun.results.push(createScreenshotResult(scenarioId, screenshotPath));

      runRepository.create(testRun);

      const response = await fetch(
        `${baseUrl}/runs/${runId}/scenarios/${scenarioId}/screenshot`,
      );

      const responseBuffer = Buffer.from(await response.arrayBuffer());

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("image/png");
      expect(responseBuffer).toEqual(screenshotBuffer);
    } finally {
      await rm(path.dirname(screenshotPath), {
        recursive: true,
        force: true,
      });
    }
  });

  it("should return 404 when run does not exist", async () => {
    const response = await fetch(
      `${baseUrl}/runs/non-existent-run/scenarios/scenario-1/screenshot`,
    );

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("RUN_NOT_FOUND");
  });

  it("should return 404 when scenario result does not exist", async () => {
    const runId = `screenshot-test-${Date.now()}`;

    runRepository.create(createTestRun(runId));

    const response = await fetch(
      `${baseUrl}/runs/${runId}/scenarios/non-existent-scenario/screenshot`,
    );

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("SCENARIO_RESULT_NOT_FOUND");
  });

  it("should return 404 when scenario has no screenshot", async () => {
    const runId = `screenshot-test-${Date.now()}`;
    const scenarioId = "scenario-1";

    const testRun = createTestRun(runId);

    testRun.results.push(createScreenshotResult(scenarioId, null));

    runRepository.create(testRun);

    const response = await fetch(
      `${baseUrl}/runs/${runId}/scenarios/${scenarioId}/screenshot`,
    );

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("SCREENSHOT_NOT_FOUND");
  });

  it("should return 400 when the request body is not valid JSON", async () => {
    const response = await fetch(`${baseUrl}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{ not json",
    });

    const body = await response.json();

    expect(response.status).toBe(400);

    expect(body).toEqual({
      success: false,
      error: {
        code: "INVALID_JSON",
        message: "Request body is not valid JSON",
      },
    });
  });
});
