import { z } from "zod";
import type { Tool } from "../types/tool.types.js";
import { createNameMatcher } from "../utils/create-name-matcher.js";

const CLICK_TIMEOUT_MS = 5000;

const clickElementParameters = z.strictObject({
  role: z.enum(["button", "link"]),
  name: z.string().trim().min(1),
  occurrence: z.number().int().positive().optional(),
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
    'Click a webpage button or link using its accessible role and name. Capital letters in the name do not matter. If several visible elements share the name, set "occurrence" to choose one: 1 is the first from the top of the page.',
  parameters: clickElementParameters,

  execute: async ({ role, name, occurrence }, { page }) => {
    const matches = page.getByRole(role, {
      name: createNameMatcher(name),
      includeHidden: true,
    });

    if ((await matches.count()) === 0) {
      return {
        success: false,
        data: null,
        error: {
          code: "ELEMENT_NOT_FOUND",
          message: `No ${role} named "${name}" was found`,
        },
      };
    }

    const visibleMatches = matches.filter({ visible: true });
    const visibleCount = await visibleMatches.count();

    if (visibleCount === 0) {
      return {
        success: false,
        data: null,
        error: {
          code: "ELEMENT_NOT_VISIBLE",
          message: `${role} "${name}" is not visible`,
        },
      };
    }

    if (visibleCount > 1 && occurrence === undefined) {
      return {
        success: false,
        data: null,
        error: {
          code: "AMBIGUOUS_ELEMENT",
          message: `${visibleCount} visible ${role} elements named "${name}" were found. Set "occurrence" from 1 to ${visibleCount} to choose one`,
        },
      };
    }

    if (occurrence !== undefined && occurrence > visibleCount) {
      return {
        success: false,
        data: null,
        error: {
          code: "OCCURRENCE_NOT_FOUND",
          message: `Only ${visibleCount} visible ${role} elements named "${name}" were found`,
        },
      };
    }

    const element = visibleMatches.nth((occurrence ?? 1) - 1);

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

    try {
      await element.click({ timeout: CLICK_TIMEOUT_MS });
    } catch {
      return {
        success: false,
        data: null,
        error: {
          code: "CLICK_FAILED",
          message: `${role} "${name}" could not be clicked. Another element may be covering it`,
        },
      };
    }

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
