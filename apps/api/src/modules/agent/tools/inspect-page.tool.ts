import { z } from "zod";

import type { Tool } from "../types/tool.types.js";

type InspectPageResult = {
  url: string;
  title: string;
  headings: {
    level: number;
    text: string;
  }[];
  buttons: {
    text: string;
    type: string;
    disabled: boolean;
    isVisible: boolean;
  }[];
  links: {
    text: string;
    href: string | null;
    target: string | null;
    isVisible: boolean;
  }[];
  metadata: {
    totalLinks: number;
    collectedLinks: number;
    truncated: boolean;
  };
  formElements: {
    tagName: "input" | "textarea" | "select";
    type: string | null;
    name: string | null;
    placeholder: string | null;
    disabled: boolean;
    options?: {
      text: string;
      value: string;
    }[];
  }[];
};

const inspectPageParameters = z.strictObject({});

export const inspectPageTool: Tool<
  z.infer<typeof inspectPageParameters>,
  InspectPageResult
> = {
  name: "inspect_page",
  description:
    "Inspect the current webpage and retrieve its URL, title, headings, buttons, links, and form elements.",
  parameters: inspectPageParameters,

  execute: async (_args, context) => {
    const { page } = context;

    const url = page.url();
    const title = await page.title();

    const headings = await page
      .locator("h1, h2, h3, h4, h5, h6")
      .evaluateAll((elements) =>
        elements.map((element) => ({
          level: Number(element.tagName.substring(1)),
          text: element.textContent?.trim() ?? "",
        })),
      );

    const buttons = await page.locator("button").evaluateAll((elements) =>
      elements.map((element) => {
        const button = element as HTMLButtonElement;
        const style = window.getComputedStyle(button);
        const rect = button.getBoundingClientRect();

        return {
          text: button.textContent?.trim() ?? "",
          type: button.type,
          disabled: button.disabled,
          isVisible:
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== "hidden" &&
            style.visibility !== "collapse",
        };
      }),
    );

    const totalLinks = await page.locator("a").count();

    const links = await page.locator("a").evaluateAll((elements) =>
      elements.slice(0, 100).map((element) => {
        const link = element as HTMLAnchorElement;
        const style = window.getComputedStyle(link);
        const rect = link.getBoundingClientRect();

        return {
          text: link.textContent?.trim() ?? "",
          href: link.href || null,
          target: link.getAttribute("target"),
          isVisible:
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== "hidden" &&
            style.visibility !== "collapse",
        };
      }),
    );

    const formElements = await page
      .locator("input:visible, textarea:visible, select:visible")
      .evaluateAll((elements) =>
        elements.map((element) => {
          const tagName = element.tagName.toLowerCase();

          if (tagName === "input") {
            const input = element as HTMLInputElement;

            return {
              tagName: "input" as const,
              type: input.type,
              name: input.name || null,
              placeholder: input.placeholder || null,
              disabled: input.disabled,
            };
          }

          if (tagName === "textarea") {
            const textarea = element as HTMLTextAreaElement;

            return {
              tagName: "textarea" as const,
              type: null,
              name: textarea.name || null,
              placeholder: textarea.placeholder || null,
              disabled: textarea.disabled,
            };
          }

          const select = element as HTMLSelectElement;

          return {
            tagName: "select" as const,
            type: null,
            name: select.name || null,
            placeholder: null,
            disabled: select.disabled,
            options: Array.from(select.options).map((option) => ({
              text: option.textContent?.trim() ?? "",
              value: option.value,
            })),
          };
        }),
      );

    return {
      success: true,
      data: {
        url,
        title,
        headings,
        buttons,
        links,
        metadata: {
          totalLinks,
          collectedLinks: links.length,
          truncated: totalLinks > links.length,
        },
        formElements,
      },
      error: null,
    };
  },
};
