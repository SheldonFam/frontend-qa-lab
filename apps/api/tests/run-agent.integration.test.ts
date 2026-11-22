import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import { access } from "node:fs/promises";

import type { AgentClient } from "../src/modules/agent/clients/agent-client.js";

import {
  createRun,
  executeRun,
  getRun,
} from "../src/modules/runs/services/run.service.js";

import { runRepository } from "../src/modules/runs/repositories/run.repository.js";

// Local test website
let fixtureServer: Server;
let targetUrl: string;
let requestedLanguages: string[] = [];

// Mock Agent Client
const mockAgentClient: AgentClient = {
  async generateResponse({ messages }) {
    const toolResults = messages.filter((message) => message.role === "tool");

    // First turn: inspect webpage
    if (toolResults.length === 0) {
      return {
        type: "tool_calls",
        toolCalls: [
          {
            id: "call_inspect_page_1",
            name: "inspect_page",
            arguments: {},
          },
        ],
      };
    }

    // Second turn: inspect returned webpage information
    if (toolResults.length === 1) {
      const result: unknown = JSON.parse(toolResults[0].content);

      if (
        typeof result !== "object" ||
        result === null ||
        !("success" in result) ||
        !("data" in result)
      ) {
        return {
          type: "final",
          message: "Invalid inspect_page result.",
        };
      }

      const data = result.data;

      if (
        result.success === true &&
        typeof data === "object" &&
        data !== null &&
        "links" in data &&
        Array.isArray(data.links)
      ) {
        const hasLearnMoreLink = data.links.some(
          (link: unknown) =>
            typeof link === "object" &&
            link !== null &&
            "text" in link &&
            link.text === "Learn more",
        );

        if (hasLearnMoreLink) {
          return {
            type: "tool_calls",
            toolCalls: [
              {
                id: "call_assert_visible_1",
                name: "assert_visible",
                arguments: {
                  role: "link",
                  name: "Learn more",
                },
              },
            ],
          };
        }
      }

      return {
        type: "final",
        message: "The Learn more link was not found.",
      };
    }

    // Third turn: receive assertion result
    if (toolResults.length === 2) {
      return {
        type: "final",
        message: "The Learn more link is visible.",
      };
    }

    return {
      type: "final",
      message: "Unexpected tool execution count.",
    };
  },
};

describe("Run Agent Integration", () => {
  beforeAll(async () => {
    // Start a local fixture website
    fixtureServer = createServer((request, response) => {
      requestedLanguages.push(request.headers["accept-language"] ?? "");

      response.writeHead(200, {
        "Content-Type": "text/html",
      });

      response.end(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <title>Frontend QA Lab Test Page</title>
          </head>
          <body>
            <h1>Frontend QA Lab</h1>
            <a href="/learn-more">Learn more</a>
          </body>
        </html>
      `);
    });

    await new Promise<void>((resolve, reject) => {
      fixtureServer.once("error", reject);
      fixtureServer.listen(0, "127.0.0.1", resolve);
    });

    const address = fixtureServer.address();

    if (!address || typeof address === "string") {
      throw new Error("Unable to get fixture server address");
    }

    targetUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      fixtureServer.close((error) => {
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
    requestedLanguages = [];
  });

  it("should execute a complete Run using a real Playwright browser and Mock Agent", async () => {
    const input = {
      configuration: {
        targetUrl,
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
      requirements: "Verify that the Learn more link is visible.",
    };

    // Step 1: Create Run
    const run = createRun(input);

    expect(run.status).toBe("queued");
    expect(run.scenarios).toHaveLength(1);

    // Step 2: Execute Run
    // Real Browser + Real Agent Runtime + Mock Agent Client
    await executeRun(run.id, input, { agentClient: mockAgentClient });

    // Step 3: Retrieve completed Run
    const completedRun = getRun(run.id);

    expect(completedRun).toBeDefined();

    if (!completedRun) {
      throw new Error("Run was not found");
    }

    // Step 4: Verify Run status
    expect(completedRun.status).toBe("completed");
    expect(completedRun.testPlan).not.toBeNull();
    expect(completedRun.completedAt).not.toBeNull();

    // Step 5: Verify Scenario result
    expect(completedRun.results).toHaveLength(1);

    const scenarioResult = completedRun.results[0];

    expect(scenarioResult.status).toBe("passed");
    expect(scenarioResult.url).toBe(targetUrl + "/");
    expect(scenarioResult.title).toBe("Frontend QA Lab Test Page");

    // Step 6: Verify actual Agent assertions
    expect(scenarioResult.assertions).toHaveLength(1);

    expect(scenarioResult.assertions[0]).toMatchObject({
      name: "assert_visible",
      passed: true,
    });

    // Step 7: Verify screenshot evidence
    expect(scenarioResult.screenshotPath).not.toBeNull();

    if (scenarioResult.screenshotPath) {
      await expect(
        access(scenarioResult.screenshotPath),
      ).resolves.toBeUndefined();
    }

    // Step 8: Verify Scenario status
    expect(completedRun.scenarios[0].status).toBe("passed");
  }, 30_000);

  it("should ask the website for the language of each scenario", async () => {
    const input = {
      configuration: {
        targetUrl,
        languages: ["en", "ms"],
        routes: ["/"],
        viewports: [
          {
            name: "desktop",
            width: 1280,
            height: 720,
          },
        ],
      },
      requirements: "Verify that the Learn more link is visible.",
    };

    const run = createRun(input);

    await executeRun(run.id, input, { agentClient: mockAgentClient });

    expect(getRun(run.id)?.status).toBe("completed");

    const firstLanguages = requestedLanguages.map(
      (acceptLanguage) => acceptLanguage.split(",")[0],
    );

    expect(firstLanguages).toContain("en");
    expect(firstLanguages).toContain("ms");
  }, 60_000);
});
