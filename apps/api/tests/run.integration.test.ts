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

import app from "../src/app.js";

import { launchBrowser } from "../src/browser/browser-manager.js";
import { runAgentScenario } from "../src/modules/agent/runtime/agent-scenario-runner.js";
import { runRepository } from "../src/modules/runs/repositories/run.repository.js";

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
    expect(getBody.data.testPlan.name).toBe("Login Functionality Test");

    expect(getBody.data.results).toHaveLength(1);
    expect(getBody.data.results[0].status).toBe("passed");

    expect(launchBrowser).toHaveBeenCalledOnce();
    expect(runAgentScenario).toHaveBeenCalledOnce();
    expect(browser.close).toHaveBeenCalledOnce();
  });
});
