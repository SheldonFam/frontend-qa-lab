import { describe, expect, it } from "vitest";
import type { Page } from "playwright";
import { getFailedRequestsTool } from "./get-failed-requests.tool.js";

describe("getFailedRequestsTool", () => {
  const page = {} as Page;

  it("should return collected failed requests", async () => {
    const diagnostics = {
      consoleErrors: [],
      pageErrors: [],
      failedRequests: [
        "https://example.com/api/users - net::ERR_CONNECTION_REFUSED",
        "https://example.com/api/orders - 500 Internal Server Error",
      ],
    };

    const result = await getFailedRequestsTool.execute(
      {},
      {
        page,
        diagnostics,
      },
    );

    expect(result).toEqual({
      success: true,
      data: {
        requests: [
          "https://example.com/api/users - net::ERR_CONNECTION_REFUSED",
          "https://example.com/api/orders - 500 Internal Server Error",
        ],
        total: 2,
      },
      error: null,
    });
  });

  it("should return an empty array when there are no failed requests", async () => {
    const diagnostics = {
      consoleErrors: [],
      pageErrors: [],
      failedRequests: [],
    };

    const result = await getFailedRequestsTool.execute(
      {},
      {
        page,
        diagnostics,
      },
    );

    expect(result).toEqual({
      success: true,
      data: {
        requests: [],
        total: 0,
      },
      error: null,
    });
  });

  it("should fail when diagnostics context is missing", async () => {
    const result = await getFailedRequestsTool.execute({}, { page });

    expect(result).toEqual({
      success: false,
      data: null,
      error: {
        code: "MISSING_DIAGNOSTICS_CONTEXT",
        message: "Browser diagnostics are not available",
      },
    });
  });
});
