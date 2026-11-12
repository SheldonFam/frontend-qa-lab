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

import app from "../src/app.js";

import { launchBrowser } from "../src/browser/browser-manager.js";
import { runScenario } from "../src/modules/runs/services/scenario-runner.js";
import { runRepository } from "../src/modules/runs/repositories/run.repository.js";
import { Browser } from "playwright";

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
    // 1. Send a real HTTP POST request
    const response = await fetch(`${baseUrl}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    // 2. Read response body
    const body = await response.json();

    // 3. Verify HTTP status
    expect(response.status).toBe(400);

    // 4. Verify validation error
    expect(body).toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid test configuration",
      },
    });

    // 5. Verify Playwright was not triggered
    expect(launchBrowser).not.toHaveBeenCalled();
    expect(runScenario).not.toHaveBeenCalled();

    // 6. Verify no Run was created
    expect(runRepository.findAll()).toHaveLength(0);
  });

  it("should create a run and execute it in the background", async () => {
    // 1. Prepare valid configuration
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

    // 2. Create a mock Browser
    const browser = {
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;

    // 3. Mock Browser Manager
    vi.mocked(launchBrowser).mockResolvedValue(browser);

    // 4. Mock Scenario Runner
    vi.mocked(runScenario).mockImplementation(
      async (_browser, config, scenario) => ({
        scenarioId: scenario.id,
        status: "passed",
        url: new URL(scenario.route, config.targetUrl).toString(),
        title: "Example Domain",
        error: null,
      }),
    );

    // 5. Send a real HTTP POST request
    const response = await fetch(`${baseUrl}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(configuration),
    });

    // 6. Read response body
    const body = await response.json();

    // 7. Verify HTTP response
    expect(response.status).toBe(202);

    expect(body).toMatchObject({
      success: true,
      data: {
        status: "queued",
        targetUrl: configuration.targetUrl,
      },
    });

    // 8. Get Run ID
    const runId = body.data.id;

    // 9. Wait for background execution to complete
    await vi.waitFor(() => {
      expect(runRepository.findById(runId)?.status).toBe("completed");
    });

    // 10. Get the completed Run through real HTTP GET
    const getResponse = await fetch(`${baseUrl}/runs/${runId}`);

    const getBody = await getResponse.json();

    // 11. Verify GET response
    expect(getResponse.status).toBe(200);

    expect(getBody.data.status).toBe("completed");
    expect(getBody.data.results).toHaveLength(1);
    expect(getBody.data.results[0].status).toBe("passed");

    // 12. Verify Playwright workflow
    expect(launchBrowser).toHaveBeenCalledOnce();
    expect(runScenario).toHaveBeenCalledOnce();
    expect(browser.close).toHaveBeenCalledOnce();
  });
});
