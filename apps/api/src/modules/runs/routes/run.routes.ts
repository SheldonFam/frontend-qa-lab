import { Router } from "express";
import {
  createRunController,
  getAllRunsController,
  getRunController,
} from "../controllers/run.controller.js";

const router = Router();

router.post("/", createRunController);
router.get("/:id", getRunController);
router.get("/", getAllRunsController);

export default router;
