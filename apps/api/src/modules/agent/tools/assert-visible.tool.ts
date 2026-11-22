import { z } from "zod";
import type { Tool } from "../types/tool.types.js";
import { createNameMatcher } from "../utils/create-name-matcher.js";

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
    "Check whether a webpage element with the specified role and accessible name is visible. Capital letters in the name do not matter. It passes when at least one matching element is visible.",
  parameters: assertVisibleParameters,

  execute: async ({ role, name }, { page }) => {
    const matches = page.getByRole(role, {
      name: createNameMatcher(name),
      includeHidden: true,
    });

    if ((await matches.count()) === 0) {
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

    const visibleCount = await matches.filter({ visible: true }).count();
    const isVisible = visibleCount > 0;

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
