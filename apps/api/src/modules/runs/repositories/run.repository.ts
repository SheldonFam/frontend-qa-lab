import { and, eq, inArray } from "drizzle-orm";

import { database } from "../../../database/database.js";
import { runs, scenarios } from "../../../database/schema.js";

import { UNFINISHED_RUN_STATUSES } from "../utils/run-status.js";

import type { TestRun } from "../types/run.types.js";
import type { ScenarioResult, TestScenario } from "../types/scenario.types.js";

type RunRow = typeof runs.$inferSelect;
type ScenarioRow = typeof scenarios.$inferSelect;

function toRunRow(testRun: TestRun): RunRow {
  return {
    id: testRun.id,
    targetUrl: testRun.targetUrl,
    status: testRun.status,
    requirements: testRun.requirements,
    error: testRun.error,
    createdAt: testRun.createdAt,
    startedAt: testRun.startedAt,
    completedAt: testRun.completedAt,
    testPlan: testRun.testPlan,
  };
}

function toScenarioRow(
  runId: string,
  scenario: TestScenario,
  position: number,
): ScenarioRow {
  return {
    id: scenario.id,
    runId,
    position,
    language: scenario.language,
    route: scenario.route,
    viewportName: scenario.viewport.name,
    viewportWidth: scenario.viewport.width,
    viewportHeight: scenario.viewport.height,
    status: scenario.status,
    result: null,
  };
}

function toTestRun(runRow: RunRow, scenarioRows: ScenarioRow[]): TestRun {
  const testScenarios: TestScenario[] = [];
  const results: ScenarioResult[] = [];

  for (const scenarioRow of scenarioRows) {
    testScenarios.push({
      id: scenarioRow.id,
      language: scenarioRow.language,
      route: scenarioRow.route,
      viewport: {
        name: scenarioRow.viewportName,
        width: scenarioRow.viewportWidth,
        height: scenarioRow.viewportHeight,
      },
      status: scenarioRow.status,
    });

    if (scenarioRow.result && scenarioRow.status !== "pending") {
      results.push({
        scenarioId: scenarioRow.id,
        status: scenarioRow.status,
        ...scenarioRow.result,
      });
    }
  }

  return {
    id: runRow.id,
    targetUrl: runRow.targetUrl,
    status: runRow.status,
    createdAt: runRow.createdAt,
    startedAt: runRow.startedAt,
    completedAt: runRow.completedAt,
    scenarios: testScenarios,
    results,
    requirements: runRow.requirements,
    testPlan: runRow.testPlan,
    error: runRow.error,
  };
}

function findScenarioRows(runId: string): ScenarioRow[] {
  return database
    .select()
    .from(scenarios)
    .where(eq(scenarios.runId, runId))
    .orderBy(scenarios.position)
    .all();
}

export const runRepository = {
  create(testRun: TestRun): TestRun {
    database.transaction((transaction) => {
      transaction.insert(runs).values(toRunRow(testRun)).run();

      testRun.scenarios.forEach((scenario, position) => {
        transaction
          .insert(scenarios)
          .values(toScenarioRow(testRun.id, scenario, position))
          .run();
      });
    });

    return testRun;
  },

  findById(id: string): TestRun | undefined {
    const runRow = database.select().from(runs).where(eq(runs.id, id)).get();

    if (!runRow) {
      return undefined;
    }

    return toTestRun(runRow, findScenarioRows(id));
  },

  findAll(): TestRun[] {
    const runRows = database.select().from(runs).orderBy(runs.createdAt).all();

    return runRows.map((runRow) =>
      toTestRun(runRow, findScenarioRows(runRow.id)),
    );
  },

  update(
    id: string,
    updates: Partial<
      Pick<
        TestRun,
        "status" | "startedAt" | "completedAt" | "testPlan" | "error"
      >
    >,
  ): void {
    database.update(runs).set(updates).where(eq(runs.id, id)).run();
  },

  addScenarioResult(runId: string, result: ScenarioResult): void {
    const { scenarioId, status, ...savedResult } = result;

    const updated = database
      .update(scenarios)
      .set({ status, result: savedResult })
      .where(and(eq(scenarios.id, scenarioId), eq(scenarios.runId, runId)))
      .run();

    if (updated.changes === 0) {
      throw new Error("Scenario not found in this run");
    }
  },

  failUnfinishedRuns(error: string): void {
    database
      .update(runs)
      .set({
        status: "failed",
        completedAt: new Date().toISOString(),
        error,
      })
      .where(inArray(runs.status, UNFINISHED_RUN_STATUSES))
      .run();
  },

  clear(): void {
    database.delete(runs).run();
  },
};
