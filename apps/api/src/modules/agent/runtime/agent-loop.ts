import type {
  AgentClient,
  AgentMessage,
  AgentToolDefinition,
} from "../clients/agent-client.js";

import type { ToolResult } from "../types/tool.types.js";

type AgentLoopInput = {
  client: AgentClient;
  messages: AgentMessage[];
  tools: AgentToolDefinition[];
  executeTool: (
    toolName: string,
    args: unknown,
  ) => Promise<ToolResult<unknown>>;
  maxSteps: number;
};

export type AgentLoopResult = {
  status: "completed" | "max_steps_reached";
  message: string | null;
  messages: AgentMessage[];
  steps: number;
};

export async function runAgentLoop(
  input: AgentLoopInput,
): Promise<AgentLoopResult> {
  const { client, messages, tools, executeTool, maxSteps } = input;

  const conversation = [...messages];

  let steps = 0;

  while (steps < maxSteps) {
    const response = await client.generateResponse({
      messages: conversation,
      tools,
    });

    // LLM has finished the task
    if (response.type === "final") {
      conversation.push({
        role: "assistant",
        content: response.message,
      });

      return {
        status: "completed",
        message: response.message,
        messages: conversation,
        steps,
      };
    }

    // Keep the assistant's Tool Calls in conversation history
    conversation.push({
      role: "assistant",
      content: "",
      toolCalls: response.toolCalls,
    });

    // Execute each Tool Call
    for (const toolCall of response.toolCalls) {
      if (steps >= maxSteps) {
        return {
          status: "max_steps_reached",
          message: null,
          messages: conversation,
          steps,
        };
      }

      steps += 1;

      const result = await executeTool(toolCall.name, toolCall.arguments);

      conversation.push({
        role: "tool",
        toolCallId: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }

  return {
    status: "max_steps_reached",
    message: null,
    messages: conversation,
    steps,
  };
}
