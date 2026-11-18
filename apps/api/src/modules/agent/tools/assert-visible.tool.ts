import { z } from "zod";
import type { Tool } from "../types/tool.types.js";

const assertVisibleParameters = z.strictObject({
  role: z.enum([
    "button",
    "link",
    "heading",
    "textbox",
    "checkbox",
    "radio",
    "combobox",
    "img",
  ]),
  name: z.string().trim().min(1),
});

type AssertVisibleResult = {
  role: string;
  name: string;
  passed: boolean;
  reason: "VISIBLE" | "ELEMENT_NOT_FOUND" | "ELEMENT_NOT_VISIBLE";
};

export const assertVisibleTool: Tool<
  z.infer<typeof assertVisibleParameters>,
  AssertVisibleResult
> = {
  name: "assert_visible",
  description:
    "Check whether a webpage element with the specified role and accessible name is visible.",
  parameters: assertVisibleParameters,

  execute: async ({ role, name }, { page }) => {
    const element = page.getByRole(role, {
      name,
      exact: true,
      includeHidden: true,
    });

    const count = await element.count();

    if (count === 0) {
      return {
        success: true,
        data: {
          role,
          name,
          passed: false,
          reason: "ELEMENT_NOT_FOUND",
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
          message: `Multiple ${role} elements named "${name}" were found`,
        },
      };
    }

    const isVisible = await element.isVisible();

    return {
      success: true,
      data: {
        role,
        name,
        passed: isVisible,
        reason: isVisible ? "VISIBLE" : "ELEMENT_NOT_VISIBLE",
      },
      error: null,
    };
  },
};
