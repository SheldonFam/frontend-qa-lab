import { toolRegistry } from "./registry/tool-registry.js";
import { inspectPageTool } from "./tools/inspect-page.tool.js";
import { fillInputTool } from "./tools/fill-input.tool.js";
import { assertVisibleTool } from "./tools/assert-visible.tool.js";
import { assertTextTool } from "./tools/assert-text.tool.js";
import { assertUrlTool } from "./tools/assert-url.tool.js";
import { takeScreenshotTool } from "./tools/take-screenshot.tool.js";
import { getConsoleErrorsTool } from "./tools/get-console-errors.tool.js";
import { clickElementTool } from "./tools/click-element.tool.js";
import { getFailedRequestsTool } from "./tools/get-failed-requests.tool.js";
import type { Tool } from "./types/tool.types.js";

function registerOnce<TArgs, TResult>(tool: Tool<TArgs, TResult>): void {
  if (!toolRegistry.has(tool.name)) {
    toolRegistry.register(tool);
  }
}

export function registerAgentTools(): void {
  registerOnce(inspectPageTool);
  registerOnce(fillInputTool);
  registerOnce(assertVisibleTool);
  registerOnce(assertTextTool);
  registerOnce(assertUrlTool);
  registerOnce(takeScreenshotTool);
  registerOnce(getConsoleErrorsTool);
  registerOnce(getFailedRequestsTool);
  registerOnce(clickElementTool);
}
