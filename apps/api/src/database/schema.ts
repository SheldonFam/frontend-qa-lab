import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { TestPlan } from "../modules/planner/schemas/test-plan.schema.js";
import type { RunStatus } from "../modules/runs/types/run.types.js";
import type {
  ScenarioResult,
  TestScenario,
} from "../modules/runs/types/scenario.types.js";

export type SavedScenarioResult = Omit<ScenarioResult, "scenarioId" | "status">;

export const runs = sqliteTable("runs", {
  id: text("id").primaryKey(),
  targetUrl: text("target_url").notNull(),
  status: text("status").$type<RunStatus>().notNull(),
  requirements: text("requirements").notNull(),
  error: text("error"),
  createdAt: text("created_at").notNull(),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  testPlan: text("test_plan", { mode: "json" }).$type<TestPlan>(),
});

export const scenarios = sqliteTable(
  "scenarios",
  {
    id: text("id").primaryKey(),
    runId: text("run_id")
      .notNull()
      .references(() => runs.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    language: text("language").notNull(),
    route: text("route").notNull(),
    viewportName: text("viewport_name").notNull(),
    viewportWidth: integer("viewport_width").notNull(),
    viewportHeight: integer("viewport_height").notNull(),
    status: text("status").$type<TestScenario["status"]>().notNull(),
    result: text("result", { mode: "json" }).$type<SavedScenarioResult>(),
  },
  (table) => [index("scenarios_run_id_index").on(table.runId)],
);
