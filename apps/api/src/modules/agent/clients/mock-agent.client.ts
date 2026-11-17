import type {
  AgentClient,
  AgentClientInput,
  AgentClientResponse,
} from "./agent-client.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseToolResult(content: string): unknown {
  try {
    return JSON.parse(content) as unknown;
  } catch {
    return null;
  }
}

export function createMockAgentClient(): AgentClient {
  return {
    generateResponse: async (
      input: AgentClientInput,
    ): Promise<AgentClientResponse> => {
      const toolMessages = input.messages.filter(
        (message) => message.role === "tool",
      );

      // First decision: inspect the page.
      if (toolMessages.length === 0) {
        return {
          type: "tool_calls",
          toolCalls: [
            {
              id: "mock_call_001",
              name: "inspect_page",
              arguments: {},
            },
          ],
        };
      }

      const latestToolMessage = toolMessages[toolMessages.length - 1];

      if (!latestToolMessage) {
        return {
          type: "final",
          message: "No tool result was available.",
        };
      }

      const toolResult = parseToolResult(latestToolMessage.content);

      if (!isRecord(toolResult) || toolResult.success !== true) {
        return {
          type: "final",
          message: "The page inspection or tool execution failed.",
        };
      }

      const data = toolResult.data;

      // Second decision: inspect the actual page information.
      if (isRecord(data) && Array.isArray(data.buttons)) {
        const hasLoginButton = data.buttons.some(
          (button: unknown) =>
            isRecord(button) &&
            button.text === "Login" &&
            button.isVisible === true &&
            button.disabled === false,
        );

        if (!hasLoginButton) {
          return {
            type: "final",
            message: "No visible, enabled Login button was found.",
          };
        }

        return {
          type: "tool_calls",
          toolCalls: [
            {
              id: "mock_call_002",
              name: "assert_visible",
              arguments: {
                role: "button",
                name: "Login",
              },
            },
          ],
        };
      }

      // Final decision: read the assertion result.
      if (isRecord(data) && typeof data.passed === "boolean") {
        return {
          type: "final",
          message: data.passed
            ? "The Login button is visible. Inspection completed."
            : "The Login button visibility assertion failed.",
        };
      }

      return {
        type: "final",
        message: "The agent could not determine the inspection result.",
      };
    },
  };
}
