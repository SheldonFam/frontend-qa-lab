import { describe, expect, it } from "vitest";
import { z } from "zod";
import type { Tool, ToolContext } from "../types/tool.types.js";
import { toolRegistry } from "./tool-registry.js";

describe("toolRegistry", () => {
  it("should register and retrieve a tool", () => {
    const testTool: Tool<{ name: string }, { message: string }> = {
      name: "test_tool",
      description: "A test tool",
      parameters: z.strictObject({
        name: z.string(),
      }),
      execute: async (args) => ({
        success: true,
        data: {
          message: `Hello ${args.name}`,
        },
        error: null,
      }),
    };

    toolRegistry.register(testTool);

    const registeredTool = toolRegistry.get("test_tool");

    expect(registeredTool).toBeDefined();
    expect(registeredTool?.name).toBe("test_tool");
  });

  it("should throw an error when registering a duplicate tool", () => {
    const testTool: Tool<{ name: string }, { message: string }> = {
      name: "duplicate_test_tool",
      description: "A test tool",
      parameters: z.strictObject({
        name: z.string(),
      }),
      execute: async (args) => ({
        success: true,
        data: {
          message: `Hello ${args.name}`,
        },
        error: null,
      }),
    };

    toolRegistry.register(testTool);

    expect(() => {
      toolRegistry.register(testTool);
    }).toThrow('Tool "duplicate_test_tool" is already registered');
  });

  it("should reject invalid tool arguments", async () => {
    let executed = false;

    const testTool: Tool<{ name: string }, { message: string }> = {
      name: "validation_test_tool",
      description: "A test tool",
      parameters: z.strictObject({
        name: z.string(),
      }),
      execute: async (args) => {
        executed = true;

        return {
          success: true,
          data: {
            message: `Hello ${args.name}`,
          },
          error: null,
        };
      },
    };

    toolRegistry.register(testTool);

    const registeredTool = toolRegistry.get("validation_test_tool");

    if (!registeredTool) {
      throw new Error("Tool not found");
    }

    const result = await registeredTool.execute(
      { name: 123 },
      {} as ToolContext,
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("INVALID_ARGUMENTS");
    }

    expect(executed).toBe(false);
  });

  it("should execute a tool with valid arguments", async () => {
    const testTool: Tool<{ name: string }, { message: string }> = {
      name: "valid_arguments_test_tool",
      description: "A test tool",
      parameters: z.strictObject({
        name: z.string(),
      }),
      execute: async (args) => ({
        success: true,
        data: {
          message: `Hello ${args.name}`,
        },
        error: null,
      }),
    };

    toolRegistry.register(testTool);

    const registeredTool = toolRegistry.get("valid_arguments_test_tool");

    if (!registeredTool) {
      throw new Error("Tool not found");
    }

    const result = await registeredTool.execute(
      { name: "Sheldon" },
      {} as ToolContext,
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result).toEqual({
        success: true,
        data: {
          message: "Hello Sheldon",
        },
        error: null,
      });
    }
  });
});
