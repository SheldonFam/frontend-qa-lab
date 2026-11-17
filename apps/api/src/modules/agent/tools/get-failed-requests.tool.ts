import { z } from "zod";
import type { Tool } from "../types/tool.types.js";

const getFailedRequestsParameters = z.strictObject({});

type GetFailedRequestsResult = {
  requests: string[];
  total: number;
};

export const getFailedRequestsTool: Tool<
  z.infer<typeof getFailedRequestsParameters>,
  GetFailedRequestsResult
> = {
  name: "get_failed_requests",
  description:
    "Retrieve failed network requests collected from the current browser page.",
  parameters: getFailedRequestsParameters,

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

    const requests = [...diagnostics.failedRequests];

    return {
      success: true,
      data: {
        requests,
        total: requests.length,
      },
      error: null,
    };
  },
};
