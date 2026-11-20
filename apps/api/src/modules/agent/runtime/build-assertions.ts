import type { AgentMessage } from "../clients/agent-client.js";
import { isRecord } from "../utils/is-record.js";

import type { ScenarioResult } from "../../runs/types/scenario.types.js";

function parseToolResult(content: string): Record<string, unknown> | null {
  try {
    const result: unknown = JSON.parse(content);
    return isRecord(result) ? result : null;
  } catch {
    return null;
  }
}

export function buildAssertions(messages: AgentMessage[]): {
  assertions: ScenarioResult["assertions"];
  error: string | null;
} {
  const toolNames = new Map<string, string>();

  for (const message of messages) {
    if (message.role !== "assistant" || !message.toolCalls) {
      continue;
    }

    for (const toolCall of message.toolCalls) {
      toolNames.set(toolCall.id, toolCall.name);
    }
  }

  const assertions: ScenarioResult["assertions"] = [];
  const errors: string[] = [];

  for (const message of messages) {
    if (message.role !== "tool") {
      continue;
    }

    const toolName = toolNames.get(message.toolCallId);

    if (
      toolName !== "assert_visible" &&
      toolName !== "assert_text" &&
      toolName !== "assert_url"
    ) {
      continue;
    }

    const result = parseToolResult(message.content);

    if (!result) {
      errors.push(`${toolName}: Invalid tool result`);
      continue;
    }

    if (result.success !== true) {
      const toolError = isRecord(result.error)
        ? result.error.message
        : "Unknown tool error";

      errors.push(`${toolName}: ${String(toolError)}`);
      continue;
    }

    const data = result.data;

    if (!isRecord(data) || typeof data.passed !== "boolean") {
      errors.push(`${toolName}: Invalid assertion result`);
      continue;
    }

    assertions.push({
      name: toolName,
      passed: data.passed,
      message: JSON.stringify(data),
    });
  }

  return {
    assertions,
    error: errors.length > 0 ? errors.join("; ") : null,
  };
}
