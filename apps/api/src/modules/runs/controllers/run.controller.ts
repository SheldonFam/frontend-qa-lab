import type { RequestHandler } from "express";

import { createRunInputSchema } from "../schemas/create-run.schema.js";
import { addRunToQueue } from "../services/run-queue.js";
import { createRun, getAllRuns, getRun } from "../services/run.service.js";

const MAX_SCENARIOS_PER_RUN = 30;

export const createRunController: RequestHandler = (req, res) => {
  const result = createRunInputSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid run input",
        details: result.error.issues,
      },
    });

    return;
  }

  const { languages, routes, viewports } = result.data.configuration;
  const scenarioCount = languages.length * routes.length * viewports.length;

  if (scenarioCount > MAX_SCENARIOS_PER_RUN) {
    res.status(400).json({
      success: false,
      error: {
        code: "TOO_MANY_SCENARIOS",
        message: `A run can have at most ${MAX_SCENARIOS_PER_RUN} scenarios, but this one has ${scenarioCount}`,
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
  addRunToQueue(testRun.id, result.data);
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
