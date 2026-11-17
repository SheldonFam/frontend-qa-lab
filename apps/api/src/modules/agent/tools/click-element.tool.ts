import { z } from "zod";
import type { Tool } from "../types/tool.types.js";

const clickElementParameters = z.strictObject({
  role: z.enum(["button", "link"]),
  name: z.string().trim().min(1),
});

type ClickElementResult = {
  role: "button" | "link";
  name: string;
  clicked: boolean;
};

export const clickElementTool: Tool<
  z.infer<typeof clickElementParameters>,
  ClickElementResult
> = {
  name: "click_element",
  description:
    "Click a webpage button or link using its accessible role and name.",
  parameters: clickElementParameters,

  execute: async ({ role, name }, { page }) => {
    const element = page.getByRole(role, {
      name,
      exact: true,
      includeHidden: true,
    });

    const count = await element.count();

    if (count === 0) {
      return {
        success: false,
        data: null,
        error: {
          code: "ELEMENT_NOT_FOUND",
          message: `No ${role} named "${name}" was found`,
        },
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

    if (!(await element.isVisible())) {
      return {
        success: false,
        data: null,
        error: {
          code: "ELEMENT_NOT_VISIBLE",
          message: `${role} "${name}" is not visible`,
        },
      };
    }

    if (!(await element.isEnabled())) {
      return {
        success: false,
        data: null,
        error: {
          code: "ELEMENT_DISABLED",
          message: `${role} "${name}" is disabled`,
        },
      };
    }

    await element.click();

    return {
      success: true,
      data: {
        role,
        name,
        clicked: true,
      },
      error: null,
    };
  },
};
