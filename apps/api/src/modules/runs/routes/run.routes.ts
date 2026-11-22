import { Router } from "express";

import {
  cancelRunController,
  createRunController,
  getAllRunsController,
  getRunController,
} from "../controllers/run.controller.js";

import { getScenarioScreenshotController } from "../controllers/screenshot.controller.js";

const router = Router();

router.post("/", createRunController);
router.post("/:id/cancel", cancelRunController);

router.get(
  "/:id/scenarios/:scenarioId/screenshot",
  getScenarioScreenshotController,
);

router.get("/:id", getRunController);
router.get("/", getAllRunsController);

export default router;
