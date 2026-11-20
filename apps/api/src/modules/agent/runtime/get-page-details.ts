import type { ToolResult } from "../types/tool.types.js";
import { isRecord } from "../utils/is-record.js";

import type { ScenarioResult } from "../../runs/types/scenario.types.js";

type PageDetails = {
  url: string | null;
  title: string | null;
  buttons: ScenarioResult["buttons"];
  inputs: ScenarioResult["inputs"];
};

export function getPageDetails(inspection: ToolResult<unknown>): PageDetails {
  const pageDetails: PageDetails = {
    url: null,
    title: null,
    buttons: [],
    inputs: [],
  };

  if (!inspection.success || !isRecord(inspection.data)) {
    return pageDetails;
  }

  const data = inspection.data;

  if (typeof data.url === "string") {
    pageDetails.url = data.url;
  }

  if (typeof data.title === "string") {
    pageDetails.title = data.title;
  }

  if (Array.isArray(data.buttons)) {
    pageDetails.buttons = data.buttons.flatMap((button) => {
      if (!isRecord(button)) {
        return [];
      }

      if (
        typeof button.text !== "string" ||
        typeof button.disabled !== "boolean"
      ) {
        return [];
      }

      return [
        {
          text: button.text,
          disabled: button.disabled,
        },
      ];
    });
  }

  if (Array.isArray(data.formElements)) {
    pageDetails.inputs = data.formElements.flatMap((element) => {
      if (!isRecord(element) || element.tagName !== "input") {
        return [];
      }

      return [
        {
          type: typeof element.type === "string" ? element.type : "text",
          name: typeof element.name === "string" ? element.name : null,
          placeholder:
            typeof element.placeholder === "string"
              ? element.placeholder
              : null,
          disabled: element.disabled === true,
        },
      ];
    });
  }

  return pageDetails;
}
