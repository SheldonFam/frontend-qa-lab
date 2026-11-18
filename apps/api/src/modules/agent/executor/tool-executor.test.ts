import { beforeEach, describe, expect, it } from "vitest";
import { toolExecutor } from "./tool-executor.js";
import { z } from "zod";
import type { Tool } from "../types/tool.types.js";
import { toolRegistry } from "../registry/tool-registry.js";

describe("toolExecutor", () => {
  it("should return an error when tool does not exist", async () => {
    const result = await toolExecutor.execute({
      toolName: "unknown_tool",
      args: {},
      context: {} as never,
      allowedTools: ["inspect_page"],
    });

    expect(result).toEqual({
      success: false,
      data: null,
      error: {
        code: "TOOL_NOT_FOUND",
        message: 'Tool "unknown_tool" was not found',
      },
    });
  });

  it("should return an error when tool is not allowed", async () => {
    const testTool: Tool<{ name: string }, { message: string }> = {
      name: "click_element",
      description: "Click an element",
      parameters: z.strictObject({
        name: z.string(),
      }),
      execute: async (args) => ({
        success: true,
        data: {
          message: `Clicked ${args.name}`,
        },
        error: null,
      }),
    };

    toolRegistry.register(testTool);

    const result = await toolExecutor.execute({
      toolName: "click_element",
      args: { name: "Login" },
      context: {} as never,
      allowedTools: ["inspect_page"],
    });

    expect(result).toEqual({
      success: false,
      data: null,
      error: {
        code: "TOOL_NOT_ALLOWED",
        message: 'Tool "click_element" is not allowed',
      },
    });
  });

  it("should execute a tool when it is allowed", async () => {
    let executed = false;

    const testTool: Tool<{ name: string }, { message: string }> = {
      name: "allowed_test_tool",
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

    const result = await toolExecutor.execute({
      toolName: "allowed_test_tool",
      args: { name: "Sheldon" },
      context: {} as never,
      allowedTools: ["allowed_test_tool"],
    });

    expect(executed).toBe(true);

    expect(result).toEqual({
      success: true,
      data: {
        message: "Hello Sheldon",
      },
      error: null,
    });
  });
});
