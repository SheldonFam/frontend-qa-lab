import { z } from "zod";
import type { Tool } from "../types/tool.types.js";

const assertUrlParameters = z.strictObject({
  expectedPath: z.string().trim().min(1),
});

type AssertUrlResult = {
  expectedPath: string;
  actualPath: string;
  passed: boolean;
  reason: "URL_MATCHED" | "URL_MISMATCH";
};

export const assertUrlTool: Tool<
  z.infer<typeof assertUrlParameters>,
  AssertUrlResult
> = {
  name: "assert_url",
  description:
    "Check whether the current webpage pathname matches the expected path.",
  parameters: assertUrlParameters,

  execute: async ({ expectedPath }, { page }) => {
    const actualUrl = new URL(page.url());
    const actualPath = actualUrl.pathname;

    const passed = actualPath === expectedPath;

    return {
      success: true,
      data: {
        expectedPath,
        actualPath,
        passed,
        reason: passed ? "URL_MATCHED" : "URL_MISMATCH",
      },
      error: null,
    };
  },
};
