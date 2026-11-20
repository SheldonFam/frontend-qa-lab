import { z } from "zod";
import type { Tool } from "../types/tool.types.js";
import { saveScreenshot } from "../../../utils/screenshots.js";

const takeScreenshotParameters = z.strictObject({});

type TakeScreenshotResult = {
  screenshotPath: string;
  captured: boolean;
};

export const takeScreenshotTool: Tool<
  z.infer<typeof takeScreenshotParameters>,
  TakeScreenshotResult
> = {
  name: "take_screenshot",
  description:
    "Capture a full-page screenshot of the current browser page and save it for the current scenario.",
  parameters: takeScreenshotParameters,

  execute: async (_args, { page, runId, scenarioId }) => {
    if (!runId || !scenarioId) {
      return {
        success: false,
        data: null,
        error: {
          code: "MISSING_EXECUTION_CONTEXT",
          message: "Run ID and Scenario ID are required to save a screenshot",
        },
      };
    }

    // Prevent IDs from being used as arbitrary file paths.
    const validIdPattern = /^[a-zA-Z0-9_-]+$/;

    if (!validIdPattern.test(runId) || !validIdPattern.test(scenarioId)) {
      return {
        success: false,
        data: null,
        error: {
          code: "INVALID_EXECUTION_CONTEXT",
          message: "Run ID or Scenario ID contains invalid characters",
        },
      };
    }

    const screenshotPath = await saveScreenshot(page, runId, scenarioId);

    return {
      success: true,
      data: {
        screenshotPath,
        captured: true,
      },
      error: null,
    };
  },
};
