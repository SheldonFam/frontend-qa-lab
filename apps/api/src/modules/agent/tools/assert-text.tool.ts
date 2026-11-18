import { z } from "zod";
import type { Tool } from "../types/tool.types.js";

const assertTextParameters = z.strictObject({
  role: z.enum([
    "button",
    "link",
    "heading",
    "textbox",
    "checkbox",
    "radio",
    "combobox",
    "img",
    "alert",
  ]),
  expectedText: z.string(),
});

type AssertTextResult = {
  role: string;
  expectedText: string;
  actualText: string;
  passed: boolean;
  reason: "TEXT_MATCHED" | "TEXT_MISMATCH";
};

export const assertTextTool: Tool<
  z.infer<typeof assertTextParameters>,
  AssertTextResult
> = {
  name: "assert_text",
  description: "Check whether a webpage element contains the expected text.",
  parameters: assertTextParameters,

  execute: async ({ role, expectedText }, { page }) => {
    const element = page.getByRole(role, {
      includeHidden: true,
    });

    const count = await element.count();

    if (count === 0) {
      return {
        success: true,
        data: {
          role,
          expectedText,
          actualText: "",
          passed: false,
          reason: "TEXT_MISMATCH",
        },
        error: null,
      };
    }

    if (count > 1) {
      return {
        success: false,
        data: null,
        error: {
          code: "AMBIGUOUS_ELEMENT",
          message: `Multiple elements with role "${role}" were found`,
        },
      };
    }

    const actualText = (await element.textContent())?.trim() ?? "";
    const passed = actualText === expectedText;

    return {
      success: true,
      data: {
        role,
        expectedText,
        actualText,
        passed,
        reason: passed ? "TEXT_MATCHED" : "TEXT_MISMATCH",
      },
      error: null,
    };
  },
};
