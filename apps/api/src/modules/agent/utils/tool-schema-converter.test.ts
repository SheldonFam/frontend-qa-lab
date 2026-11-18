import { describe, expect, it } from "vitest";
import { z } from "zod";

import type { RegisteredTool } from "../types/tool.types.js";

import {
  convertToolToDefinition,
  convertToolsToDefinitions,
} from "./tool-schema-converter.js";

describe("tool-schema-converter", () => {
  const mockTool: RegisteredTool = {
    name: "click_element",
    description: "Click an element",
    parameters: z.strictObject({
      role: z.enum(["button", "link"]),
      name: z.string(),
    }),
    execute: async () => ({
      success: true,
      data: {},
      error: null,
    }),
  };

  it("should convert a Zod schema into JSON Schema", () => {
    const result = convertToolToDefinition(mockTool);

    expect(result.name).toBe("click_element");
    expect(result.description).toBe("Click an element");

    expect(result.parameters).toMatchObject({
      type: "object",
      properties: {
        role: {
          type: "string",
          enum: ["button", "link"],
        },
        name: {
          type: "string",
        },
      },
      required: ["role", "name"],
      additionalProperties: false,
    });
  });

  it("should convert multiple tools", () => {
    const result = convertToolsToDefinitions([
      mockTool,
      {
        ...mockTool,
        name: "inspect_page",
      },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("click_element");
    expect(result[1].name).toBe("inspect_page");
  });
});
