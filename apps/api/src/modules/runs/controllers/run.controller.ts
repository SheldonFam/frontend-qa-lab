import type { RequestHandler } from "express";

import { testConfigurationSchema } from "../schemas/test-configuration.schema.js";
import {
  createRun,
  executeRun,
  getAllRuns,
  getRun,
} from "../services/run.service.js";

export const createRunController: RequestHandler = (req, res) => {
  const result = testConfigurationSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid test configuration",
        details: result.error.issues,
      },
    });

    return;
  }

  const testRun = createRun(result.data);

  // Return HTTP 202 immediately
  res.status(202).json({
    success: true,
    data: testRun,
  });

  // Execute the Run in the background
  executeRun(testRun.id, result.data).catch((error: unknown) => {
    console.error(`Failed to execute run ${testRun.id}:`, error);
  });
};

export const getRunController: RequestHandler<{ id: string }> = (req, res) => {
  const testRun = getRun(req.params.id);

  if (!testRun) {
    return res.status(404).json({
      success: false,
      error: {
        code: "RUN_NOT_FOUND",
        message: "Test run not found",
      },
    });
  }

  return res.status(200).json({
    success: true,
    data: testRun,
  });
};

export const getAllRunsController: RequestHandler = (req, res) => {
  const testRun = getAllRuns();

  return res.status(200).json({
    success: true,
    data: testRun,
  });
};
