import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Browser } from "playwright";

import type { AgentClient } from "../clients/agent-client.js";
import { createMockAgentClient } from "../clients/mock-agent.client.js";

import { launchBrowser } from "../../../browser/browser-manager.js";
import { createAgentRuntime } from "./agent-runtime.js";

describe("Agent Runtime", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await launchBrowser();
  });

  afterAll(async () => {
    await browser.close();
  });

  it("should open pages in the given language", async () => {
    for (const language of ["en", "ms", "zh"]) {
      const runtime = await createAgentRuntime(browser, {
        runId: "run-language",
        scenarioId: `scenario-${language}`,
        viewport: {
          width: 1280,
          height: 720,
        },
        language,
        allowedTools: ["inspect_page"],
      });

      const browserLanguage = await runtime.page.evaluate("navigator.language");

      await runtime.close();

      expect(browserLanguage).toBe(language);
    }
  });

  it("should create a browser page and diagnostics", async () => {
    const runtime = await createAgentRuntime(browser, {
      runId: "run-1",
      scenarioId: "scenario-1",
      viewport: {
        width: 1280,
        height: 720,
      },
      language: "en",
      allowedTools: ["inspect_page"],
    });

    expect(runtime.page).toBeDefined();

    expect(runtime.diagnostics).toEqual({
      consoleErrors: [],
      pageErrors: [],
      failedRequests: [],
    });

    await runtime.close();
  });

  it("should execute an allowed tool", async () => {
    const runtime = await createAgentRuntime(browser, {
      runId: "run-2",
      scenarioId: "scenario-2",
      viewport: {
        width: 1280,
        height: 720,
      },
      language: "en",
      allowedTools: ["inspect_page"],
    });

    await runtime.page.setContent(`
      <html>
        <head>
          <title>Agent Runtime Test</title>
        </head>
        <body>
          <h1>Welcome</h1>
        </body>
      </html>
    `);

    const result = await runtime.executeTool("inspect_page", {});

    expect(result.success).toBe(true);

    await runtime.close();
  });

  it("should reject a tool that is not allowed", async () => {
    const runtime = await createAgentRuntime(browser, {
      runId: "run-3",
      scenarioId: "scenario-3",
      viewport: {
        width: 1280,
        height: 720,
      },
      language: "en",
      allowedTools: ["inspect_page"],
    });

    const result = await runtime.executeTool("click_element", {
      role: "button",
      name: "Submit",
    });

    expect(result).toEqual({
      success: false,
      data: null,
      error: {
        code: "TOOL_NOT_ALLOWED",
        message: 'Tool "click_element" is not allowed',
      },
    });

    await runtime.close();
  });

  it("should collect diagnostics through runtime page", async () => {
    const runtime = await createAgentRuntime(browser, {
      runId: "run-4",
      scenarioId: "scenario-4",
      viewport: {
        width: 1280,
        height: 720,
      },
      language: "en",
      allowedTools: ["get_console_errors"],
    });

    await runtime.page.evaluate(() => {
      console.error("Runtime diagnostic test");
    });

    expect(runtime.diagnostics.consoleErrors).toContain(
      "Runtime diagnostic test",
    );

    const result = await runtime.executeTool("get_console_errors", {});

    expect(result).toMatchObject({
      success: true,
      data: {
        errors: ["Runtime diagnostic test"],
        total: 1,
      },
    });

    await runtime.close();
  });

  it("should run the agent loop and execute multiple tools", async () => {
    const runtime = await createAgentRuntime(browser, {
      runId: "run-5",
      scenarioId: "scenario-5",
      viewport: {
        width: 1280,
        height: 720,
      },
      language: "en",
      allowedTools: ["inspect_page", "assert_visible"],
    });

    try {
      await runtime.page.setContent(`
        <html>
          <head>
            <title>Agent Integration Test</title>
          </head>
          <body>
            <h1>Welcome</h1>
            <button>Login</button>
          </body>
        </html>
      `);

      const result = await runtime.runAgent({
        client: createMockAgentClient(),
        messages: [
          {
            role: "system",
            content: "You are a frontend QA agent.",
          },
          {
            role: "user",
            content: "Inspect the page and check whether Login is visible.",
          },
        ],
        maxSteps: 5,
      });

      expect(result.status).toBe("completed");
      expect(result.message).toBe(
        "The Login button is visible. Inspection completed.",
      );
      expect(result.steps).toBe(2);

      const toolMessages = result.messages.filter(
        (message) => message.role === "tool",
      );

      expect(toolMessages).toHaveLength(2);
    } finally {
      await runtime.close();
    }
  });

  it("should only provide allowed tools to the agent client", async () => {
    const runtime = await createAgentRuntime(browser, {
      runId: "run-6",
      scenarioId: "scenario-6",
      viewport: {
        width: 1280,
        height: 720,
      },
      language: "en",
      allowedTools: ["inspect_page"],
    });

    try {
      let receivedToolNames: string[] = [];

      const client: AgentClient = {
        generateResponse: async ({ tools }) => {
          receivedToolNames = tools.map((tool) => tool.name);

          return {
            type: "final",
            message: "Tool definitions received.",
          };
        },
      };

      await runtime.runAgent({
        client,
        messages: [
          {
            role: "user",
            content: "Inspect the page.",
          },
        ],
        maxSteps: 5,
      });

      expect(receivedToolNames).toEqual(["inspect_page"]);
    } finally {
      await runtime.close();
    }
  });

  it("should record the tools that the agent runs", async () => {
    const runtime = await createAgentRuntime(browser, {
      runId: "run-7",
      scenarioId: "scenario-7",
      viewport: {
        width: 1280,
        height: 720,
      },
      language: "en",
      allowedTools: ["inspect_page", "assert_visible"],
    });

    try {
      await runtime.page.setContent(`
        <html>
          <head>
            <title>Agent Steps Test</title>
          </head>
          <body>
            <h1>Welcome</h1>
            <button>Login</button>
          </body>
        </html>
      `);

      await runtime.runAgent({
        client: createMockAgentClient(),
        messages: [
          {
            role: "user",
            content: "Inspect the page and check whether Login is visible.",
          },
        ],
        maxSteps: 5,
      });

      await runtime.executeTool("inspect_page", {});

      expect(runtime.agentSteps).toEqual([
        {
          tool: "inspect_page",
          arguments: {},
          success: true,
          passed: null,
          error: null,
        },
        {
          tool: "assert_visible",
          arguments: {
            role: "button",
            name: "Login",
          },
          success: true,
          passed: true,
          error: null,
        },
      ]);
    } finally {
      await runtime.close();
    }
  });
});
