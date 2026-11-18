import type { Browser, BrowserContext, Page, ViewportSize } from "playwright";

import type { AgentClient, AgentMessage } from "../clients/agent-client.js";
import { openAIAgentClient } from "../clients/openai-agent.client.js";

import { toolExecutor } from "../executor/tool-executor.js";
import { registerAgentTools } from "../register-agent-tools.js";

import {
  attachBrowserDiagnostics,
  createBrowserDiagnostics,
} from "../services/browser-diagnostics.js";

import { toolRegistry } from "../registry/tool-registry.js";

import { convertToolsToDefinitions } from "../utils/tool-schema-converter.js";

import { runAgentLoop, type AgentLoopResult } from "./agent-loop.js";

import type { ToolContext, ToolResult } from "../types/tool.types.js";

import {
  createBrowserContext,
  createPage,
  launchBrowser,
} from "../../../browser/browser-manager.js";

type AgentRuntimeOptions = {
  runId: string;
  scenarioId: string;
  viewport: ViewportSize;
  allowedTools: string[];
};

type RunAgentInput = {
  messages: AgentMessage[];
  maxSteps: number;
  client?: AgentClient;
};

type AgentRuntimeSession = {
  page: Page;
  context: BrowserContext;
  diagnostics: ReturnType<typeof createBrowserDiagnostics>;
  toolContext: ToolContext;

  executeTool: (
    toolName: string,
    args: unknown,
  ) => Promise<ToolResult<unknown>>;

  runAgent: (input: RunAgentInput) => Promise<AgentLoopResult>;

  close: () => Promise<void>;
};

export async function createAgentRuntime(
  browser: Browser,
  options: AgentRuntimeOptions,
): Promise<AgentRuntimeSession> {
  registerAgentTools();

  const context = await createBrowserContext(browser, options.viewport);

  try {
    const page = await createPage(context);

    const diagnostics = createBrowserDiagnostics();

    attachBrowserDiagnostics(page, diagnostics);

    const toolContext: ToolContext = {
      page,
      runId: options.runId,
      scenarioId: options.scenarioId,
      diagnostics,
    };

    const executeTool = (
      toolName: string,
      args: unknown,
    ): Promise<ToolResult<unknown>> =>
      toolExecutor.execute({
        toolName,
        args,
        context: toolContext,
        allowedTools: options.allowedTools,
      });

    const runAgent = (input: RunAgentInput): Promise<AgentLoopResult> => {
      const registeredTools = toolRegistry
        .getAll()
        .filter((tool) => options.allowedTools.includes(tool.name));

      const toolDefinitions = convertToolsToDefinitions(registeredTools);

      return runAgentLoop({
        client: input.client ?? openAIAgentClient,
        messages: input.messages,
        tools: toolDefinitions,
        executeTool,
        maxSteps: input.maxSteps,
      });
    };

    return {
      page,
      context,
      diagnostics,
      toolContext,
      executeTool,
      runAgent,
      close: async () => {
        await context.close();
      },
    };
  } catch (error) {
    await context.close();
    throw error;
  }
}

export async function launchAgentBrowser(): Promise<Browser> {
  return launchBrowser();
}
