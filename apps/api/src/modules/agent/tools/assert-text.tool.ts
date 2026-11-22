import { z } from "zod";
import type { Tool } from "../types/tool.types.js";

const assertTextParameters = z.strictObject({
  text: z.string().trim().min(1),
});

type AssertTextResult = {
  text: string;
  passed: boolean;
  reason: "TEXT_FOUND" | "TEXT_NOT_FOUND";
};

export const assertTextTool: Tool<
  z.infer<typeof assertTextParameters>,
  AssertTextResult
> = {
  name: "assert_text",
  description:
    "Check whether the webpage shows the given text anywhere on the page. Capital letters do not matter, and the text may be part of a longer sentence. Text typed into an input is not checked.",
  parameters: assertTextParameters,

  execute: async ({ text }, { page }) => {
    const visibleCount = await page
      .getByText(text)
      .filter({ visible: true })
      .count();

    const passed = visibleCount > 0;

    return {
      success: true,
      data: {
        text,
        passed,
        reason: passed ? "TEXT_FOUND" : "TEXT_NOT_FOUND",
      },
      error: null,
    };
  },
};
