import OpenAI from "openai";

import { env } from "../../../config/env.js";
import { getOpenAIErrorMessage } from "../../../utils/get-openai-error-message.js";
import type { AgentClient, AgentMessage } from "./agent-client.js";

export type OpenAIResponsesClient = Pick<OpenAI, "responses">;

type OpenAIResponseInput = Exclude<
  Parameters<OpenAIResponsesClient["responses"]["create"]>[0]["input"],
  string
>;

export function createOpenAIAgentClient(
  openai: OpenAIResponsesClient,
  modelName: string,
): AgentClient {
  return {
    async generateResponse({ messages, tools }) {
      const instructions = messages
        .filter((message) => message.role === "system")
        .map((message) => message.content)
        .join("\n\n");

      const openAITools = tools.map((tool) => ({
        type: "function" as const,
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
        strict: false,
      }));

      const input: OpenAIResponseInput = [];

      for (const message of messages) {
        if (message.role === "system") {
          continue;
        }

        if (message.role === "user") {
          input.push({
            role: "user",
            content: message.content,
          });

          continue;
        }

        if (message.role === "assistant") {
          if (message.toolCalls?.length) {
            for (const toolCall of message.toolCalls) {
              input.push({
                type: "function_call",
                call_id: toolCall.id,
                name: toolCall.name,
                arguments: JSON.stringify(toolCall.arguments ?? {}),
              });
            }
          } else {
            input.push({
              role: "assistant",
              content: message.content,
            });
          }

          continue;
        }

        if (message.role === "tool") {
          input.push({
            type: "function_call_output",
            call_id: message.toolCallId,
            output: message.content,
          });
        }
      }

      const response = await openai.responses
        .create({
          model: modelName,
          instructions,
          input,
          tools: openAITools,
        })
        .catch((error: unknown) => {
          console.error("OpenAI request failed:", error);

          throw new Error(getOpenAIErrorMessage(error));
        });

      if (response.status !== "completed") {
        throw new Error(
          `OpenAI response did not complete. Status: ${response.status}`,
        );
      }

      const functionCalls = response.output.filter(
        (item) => item.type === "function_call",
      );

      if (functionCalls.length > 0) {
        const toolCalls = functionCalls.map((call) => ({
          id: call.call_id,
          name: call.name,
          arguments: JSON.parse(call.arguments) as unknown,
        }));

        return {
          type: "tool_calls" as const,
          toolCalls,
        };
      }

      if (!response.output_text) {
        throw new Error(
          "OpenAI returned neither tool calls nor a final message.",
        );
      }

      return {
        type: "final" as const,
        message: response.output_text,
      };
    },
  };
}

// Lazily create the real OpenAI Client.
// This allows tests to import this module without requiring an API key.
let defaultClient: AgentClient | undefined;

export const openAIAgentClient: AgentClient = {
  generateResponse(input) {
    if (!defaultClient) {
      defaultClient = createOpenAIAgentClient(new OpenAI(), env.OPENAI_MODEL);
    }

    return defaultClient.generateResponse(input);
  },
};
