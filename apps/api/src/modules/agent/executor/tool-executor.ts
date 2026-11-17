import type { ToolContext, ToolResult } from "../types/tool.types.js";

import { toolRegistry } from "../registry/tool-registry.js";

type ExecuteToolInput = {
  toolName: string;
  args: unknown;
  context: ToolContext;
  allowedTools: string[];
};

export const toolExecutor = {
  execute: async ({
    toolName,
    args,
    context,
    allowedTools,
  }: ExecuteToolInput): Promise<ToolResult<unknown>> => {
    const tool = toolRegistry.get(toolName);

    if (!tool) {
      return {
        success: false,
        data: null,
        error: {
          code: "TOOL_NOT_FOUND",
          message: `Tool "${toolName}" was not found`,
        },
      };
    }

    if (!allowedTools.includes(toolName)) {
      return {
        success: false,
        data: null,
        error: {
          code: "TOOL_NOT_ALLOWED",
          message: `Tool "${toolName}" is not allowed`,
        },
      };
    }

    return tool.execute(args, context);
  },
};
