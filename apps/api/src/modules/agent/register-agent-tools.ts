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

export function registerAgentTools(): void {
  if (!toolRegistry.has(inspectPageTool.name)) {
    toolRegistry.register(inspectPageTool);
  }

  if (!toolRegistry.has(fillInputTool.name)) {
    toolRegistry.register(fillInputTool);
  }

  if (!toolRegistry.has(assertVisibleTool.name)) {
    toolRegistry.register(assertVisibleTool);
  }

  if (!toolRegistry.has(assertTextTool.name)) {
    toolRegistry.register(assertTextTool);
  }

  if (!toolRegistry.has(assertUrlTool.name)) {
    toolRegistry.register(assertUrlTool);
  }

  if (!toolRegistry.has(takeScreenshotTool.name)) {
    toolRegistry.register(takeScreenshotTool);
  }

  if (!toolRegistry.has(getConsoleErrorsTool.name)) {
    toolRegistry.register(getConsoleErrorsTool);
  }

  if (!toolRegistry.has(getFailedRequestsTool.name)) {
    toolRegistry.register(getFailedRequestsTool);
  }

  if (!toolRegistry.has(clickElementTool.name)) {
    toolRegistry.register(clickElementTool);
  }
}
