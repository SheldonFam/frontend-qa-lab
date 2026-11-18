import { describe, expect, it, vi } from "vitest";

import type {
  AgentClient,
  AgentClientInput,
  AgentClientResponse,
} from "../clients/agent-client.js";

import type { ToolResult } from "../types/tool.types.js";

import { runAgentLoop } from "./agent-loop.js";

describe("runAgentLoop", () => {
  it("should execute multiple tool calls and finish when the agent returns a final response", async () => {
    // 1. Mock LLM responses
    const responses: AgentClientResponse[] = [
      {
        type: "tool_calls",
        toolCalls: [
          {
            id: "call_001",
            name: "inspect_page",
            arguments: {},
          },
        ],
      },
      {
        type: "tool_calls",
        toolCalls: [
          {
            id: "call_002",
            name: "assert_visible",
            arguments: {
              role: "button",
              name: "Login",
            },
          },
        ],
      },
      {
        type: "final",
        message: "Login button is visible.",
      },
    ];

    const generateResponse = vi.fn(
      async (_input: AgentClientInput): Promise<AgentClientResponse> => {
        const response = responses.shift();

        if (!response) {
          throw new Error("No mock response available");
        }

        return response;
      },
    );

    const client: AgentClient = {
      generateResponse,
    };

    // 2. Mock Tool Executor
    const executeTool = vi.fn(
      async (
        toolName: string,
        _args: unknown,
      ): Promise<ToolResult<unknown>> => {
        return {
          success: true,
          data: {
            executedTool: toolName,
          },
          error: null,
        };
      },
    );

    // 3. Run Agent Loop
    const result = await runAgentLoop({
      client,
      messages: [
        {
          role: "user",
          content: "Inspect the login page.",
        },
      ],
      tools: [],
      executeTool,
      maxSteps: 5,
    });

    // 4. Verify results
    expect(result.status).toBe("completed");
    expect(result.message).toBe("Login button is visible.");
    expect(result.steps).toBe(2);

    expect(generateResponse).toHaveBeenCalledTimes(3);
    expect(executeTool).toHaveBeenCalledTimes(2);

    // 5. Verify conversation history
    expect(result.messages).toHaveLength(6);

    expect(result.messages[1]).toMatchObject({
      role: "assistant",
      toolCalls: [
        {
          id: "call_001",
          name: "inspect_page",
        },
      ],
    });

    expect(result.messages[2]).toMatchObject({
      role: "tool",
      toolCallId: "call_001",
    });

    expect(result.messages[3]).toMatchObject({
      role: "assistant",
      toolCalls: [
        {
          id: "call_002",
          name: "assert_visible",
        },
      ],
    });

    expect(result.messages[4]).toMatchObject({
      role: "tool",
      toolCallId: "call_002",
    });

    expect(result.messages[5]).toMatchObject({
      role: "assistant",
      content: "Login button is visible.",
    });
  });

  it("should stop when maxSteps is reached", async () => {
    const client: AgentClient = {
      generateResponse: vi.fn(
        async (): Promise<AgentClientResponse> => ({
          type: "tool_calls",
          toolCalls: [
            {
              id: "call_001",
              name: "inspect_page",
              arguments: {},
            },
          ],
        }),
      ),
    };

    const executeTool = vi.fn(
      async (): Promise<ToolResult<unknown>> => ({
        success: true,
        data: {},
        error: null,
      }),
    );

    const result = await runAgentLoop({
      client,
      messages: [
        {
          role: "user",
          content: "Inspect the page.",
        },
      ],
      tools: [],
      executeTool,
      maxSteps: 2,
    });

    expect(result.status).toBe("max_steps_reached");
    expect(result.steps).toBe(2);
    expect(executeTool).toHaveBeenCalledTimes(2);
    expect(client.generateResponse).toHaveBeenCalledTimes(2);
  });
});
