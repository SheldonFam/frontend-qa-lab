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
import { runScenario } from "../src/modules/runs/services/scenario-runner.js";
import { runRepository } from "../src/modules/runs/repositories/run.repository.js";

// Mock Playwright dependencies
vi.mock("../src/browser/browser-manager.js", () => ({
  launchBrowser: vi.fn(),
}));

vi.mock("../src/modules/runs/services/scenario-runner.js", () => ({
  runScenario: vi.fn(),
}));

describe("Runs API Integration", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    // Start a real Express server on an available port
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
    // Close the Express server
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
    // 1. Prepare invalid input
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

    // 2. Send a real HTTP POST request
    const response = await fetch(`${baseUrl}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invalidInput),
    });

    // 3. Read response body
    const body = await response.json();

    // 4. Verify HTTP status
    expect(response.status).toBe(400);

    // 5. Verify validation error
    expect(body).toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid run input",
      },
    });

    // 6. Verify Playwright was not triggered
    expect(launchBrowser).not.toHaveBeenCalled();
    expect(runScenario).not.toHaveBeenCalled();

    // 7. Verify no Run was created
    expect(runRepository.findAll()).toHaveLength(0);
  });

  it("should create a run and execute it in the background", async () => {
    // 1. Prepare configuration
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

    // 2. Prepare CreateRunInput
    const input = {
      configuration,
      requirements: "Test login functionality",
    };

    // 3. Create a mock Browser
    const browser = {
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;

    // 4. Mock Browser Manager
    vi.mocked(launchBrowser).mockResolvedValue(browser);

    // 5. Mock Scenario Runner
    vi.mocked(runScenario).mockImplementation(
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
        assertions: [],
        screenshotPath: null,
      }),
    );

    // 6. Send a real HTTP POST request
    const response = await fetch(`${baseUrl}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    // 7. Read response body
    const body = await response.json();

    // 8. Verify HTTP response
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

    // 9. Get Run ID
    const runId = body.data.id;

    // 10. Wait for background execution to complete
    await vi.waitFor(() => {
      expect(runRepository.findById(runId)?.status).toBe("completed");
    });

    // 11. Get the completed Run through real HTTP GET
    const getResponse = await fetch(`${baseUrl}/runs/${runId}`);

    const getBody = await getResponse.json();

    // 12. Verify GET response
    expect(getResponse.status).toBe(200);

    expect(getBody.data.status).toBe("completed");
    expect(getBody.data.requirements).toBe(input.requirements);

    // Verify Planner generated and saved the TestPlan
    expect(getBody.data.testPlan).not.toBeNull();
    expect(getBody.data.testPlan.name).toBe("Login Functionality Test");

    // Verify scenario results
    expect(getBody.data.results).toHaveLength(1);
    expect(getBody.data.results[0].status).toBe("passed");

    // 13. Verify Playwright workflow
    expect(launchBrowser).toHaveBeenCalledOnce();
    expect(runScenario).toHaveBeenCalledOnce();
    expect(browser.close).toHaveBeenCalledOnce();
  });
});
