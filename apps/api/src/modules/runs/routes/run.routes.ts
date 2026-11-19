import { Router } from "express";

import {
  createRunController,
  getAllRunsController,
  getRunController,
} from "../controllers/run.controller.js";

import { getScenarioScreenshotController } from "../controllers/screenshot.controller.js";

const router = Router();

router.post("/", createRunController);

router.get(
  "/:id/scenarios/:scenarioId/screenshot",
  getScenarioScreenshotController,
);

router.get("/:id", getRunController);
router.get("/", getAllRunsController);

export default router;
