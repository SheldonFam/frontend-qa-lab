import { z } from "zod";
import type { Tool } from "../types/tool.types.js";

const fillInputParameters = z.strictObject({
  name: z.string().trim().min(1),
  value: z.string(),
});

type FillInputResult = {
  name: string;
  filled: boolean;
};

export const fillInputTool: Tool<
  z.infer<typeof fillInputParameters>,
  FillInputResult
> = {
  name: "fill_input",
  description: "Fill a webpage input or textarea using its accessible label.",
  parameters: fillInputParameters,

  execute: async ({ name, value }, { page }) => {
    const element = page.getByLabel(name, {
      exact: true,
    });

    const count = await element.count();

    if (count === 0) {
      return {
        success: false,
        data: null,
        error: {
          code: "ELEMENT_NOT_FOUND",
          message: `No input with label "${name}" was found`,
        },
      };
    }

    if (count > 1) {
      return {
        success: false,
        data: null,
        error: {
          code: "AMBIGUOUS_ELEMENT",
          message: `Multiple inputs with label "${name}" were found`,
        },
      };
    }

    if (!(await element.isVisible())) {
      return {
        success: false,
        data: null,
        error: {
          code: "ELEMENT_NOT_VISIBLE",
          message: `Input "${name}" is not visible`,
        },
      };
    }

    if (!(await element.isEnabled())) {
      return {
        success: false,
        data: null,
        error: {
          code: "ELEMENT_DISABLED",
          message: `Input "${name}" is disabled`,
        },
      };
    }

    if (!(await element.isEditable())) {
      return {
        success: false,
        data: null,
        error: {
          code: "ELEMENT_NOT_EDITABLE",
          message: `Input "${name}" is not editable`,
        },
      };
    }

    await element.fill(value);

    return {
      success: true,
      data: {
        name,
        filled: true,
      },
      error: null,
    };
  },
};
