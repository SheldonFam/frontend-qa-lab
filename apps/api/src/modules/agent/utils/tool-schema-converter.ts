import { z } from "zod";

import type { RegisteredTool } from "../types/tool.types.js";
import type { AgentToolDefinition } from "../clients/agent-client.js";

export function convertToolToDefinition(
  tool: RegisteredTool,
): AgentToolDefinition {
  return {
    name: tool.name,
    description: tool.description,
    parameters: z.toJSONSchema(tool.parameters, {
      target: "draft-7",
    }),
  };
}

export function convertToolsToDefinitions(
  tools: RegisteredTool[],
): AgentToolDefinition[] {
  return tools.map(convertToolToDefinition);
}
