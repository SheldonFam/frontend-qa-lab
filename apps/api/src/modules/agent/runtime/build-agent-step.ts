import { isRecord } from "../utils/is-record.js";

import type { ToolResult } from "../types/tool.types.js";
import type { AgentStep } from "../../runs/types/scenario.types.js";

export function buildAgentStep(
  toolName: string,
  args: unknown,
  result: ToolResult<unknown>,
): AgentStep {
  if (!result.success) {
    return {
      tool: toolName,
      arguments: args,
      success: false,
      passed: null,
      error: result.error.message,
    };
  }

  const data = result.data;

  let passed: boolean | null = null;

  if (isRecord(data) && typeof data.passed === "boolean") {
    passed = data.passed;
  }

  return {
    tool: toolName,
    arguments: args,
    success: true,
    passed,
    error: null,
  };
}
