import { z } from "zod";
import type { Tool } from "../types/tool.types.js";

const getConsoleErrorsParameters = z.strictObject({});

type GetConsoleErrorsResult = {
  errors: string[];
  total: number;
};

export const getConsoleErrorsTool: Tool<
  z.infer<typeof getConsoleErrorsParameters>,
  GetConsoleErrorsResult
> = {
  name: "get_console_errors",
  description:
    "Retrieve console errors collected from the current browser page.",

  parameters: getConsoleErrorsParameters,

  execute: async (_args, { diagnostics }) => {
    if (!diagnostics) {
      return {
        success: false,
        data: null,
        error: {
          code: "MISSING_DIAGNOSTICS_CONTEXT",
          message: "Browser diagnostics are not available",
        },
      };
    }

    const errors = [...diagnostics.consoleErrors];

    return {
      success: true,
      data: {
        errors,
        total: errors.length,
      },
      error: null,
    };
  },
};
