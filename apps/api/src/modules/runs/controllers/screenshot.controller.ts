import type { RequestHandler } from "express";
import { stat } from "node:fs/promises";
import path from "node:path";

import { getRun } from "../services/run.service.js";
import { SCREENSHOT_DIRECTORY } from "../../../utils/screenshots.js";

export const getScenarioScreenshotController: RequestHandler<{
  id: string;
  scenarioId: string;
}> = async (req, res, next) => {
  try {
    // 1. Find the Run
    const testRun = getRun(req.params.id);

    if (!testRun) {
      res.status(404).json({
        success: false,
        error: {
          code: "RUN_NOT_FOUND",
          message: "Test run not found",
        },
      });
      return;
    }

    // 2. Find the Scenario Result
    const scenarioResult = testRun.results.find(
      (result) => result.scenarioId === req.params.scenarioId,
    );

    if (!scenarioResult) {
      res.status(404).json({
        success: false,
        error: {
          code: "SCENARIO_RESULT_NOT_FOUND",
          message: "Scenario result not found",
        },
      });
      return;
    }

    // 3. Check whether screenshot exists in the result
    if (!scenarioResult.screenshotPath) {
      res.status(404).json({
        success: false,
        error: {
          code: "SCREENSHOT_NOT_FOUND",
          message: "Screenshot not found",
        },
      });
      return;
    }

    // 4. Resolve and validate the screenshot path
    const screenshotRoot = path.resolve(process.cwd(), SCREENSHOT_DIRECTORY);
    const screenshotPath = path.resolve(scenarioResult.screenshotPath);
    const relativePath = path.relative(screenshotRoot, screenshotPath);

    const isOutsideScreenshotDirectory =
      relativePath === "" ||
      relativePath.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relativePath);

    if (isOutsideScreenshotDirectory) {
      res.status(404).json({
        success: false,
        error: {
          code: "SCREENSHOT_NOT_FOUND",
          message: "Screenshot not found",
        },
      });
      return;
    }

    // 5. Verify that the file exists
    const fileStats = await stat(screenshotPath);

    if (!fileStats.isFile()) {
      res.status(404).json({
        success: false,
        error: {
          code: "SCREENSHOT_NOT_FOUND",
          message: "Screenshot not found",
        },
      });
      return;
    }

    // 6. Send the PNG file
    res.type("png");

    res.sendFile(screenshotPath, (error) => {
      if (error) {
        next(error);
      }
    });
  } catch (error: unknown) {
    // A missing or inaccessible screenshot should return 404
    if (
      error instanceof Error &&
      "code" in error &&
      (error.code === "ENOENT" || error.code === "ENOTDIR")
    ) {
      res.status(404).json({
        success: false,
        error: {
          code: "SCREENSHOT_NOT_FOUND",
          message: "Screenshot not found",
        },
      });
      return;
    }

    next(error);
  }
};
