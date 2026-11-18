import type { RegisteredTool, Tool } from "../types/tool.types.js";

const tools = new Map<string, RegisteredTool>();

export const toolRegistry = {
  register: <TArgs, TResult>(tool: Tool<TArgs, TResult>): void => {
    if (tools.has(tool.name)) {
      throw new Error(`Tool "${tool.name}" is already registered`);
    }

    const registeredTool: RegisteredTool = {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
      execute: async (args, context) => {
        const result = tool.parameters.safeParse(args);

        if (!result.success) {
          return {
            success: false,
            data: null,
            error: {
              code: "INVALID_ARGUMENTS",
              message: "Tool arguments are invalid",
            },
          };
        }

        return tool.execute(result.data, context);
      },
    };

    tools.set(tool.name, registeredTool);
  },

  get: (name: string): RegisteredTool | undefined => {
    return tools.get(name);
  },

  getAll: (): RegisteredTool[] => {
    return Array.from(tools.values());
  },

  has: (name: string): boolean => {
    return tools.has(name);
  },
};
