import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { database } from "./database.js";
import { runs, scenarios } from "./schema.js";

function createRunRow(id: string): typeof runs.$inferInsert {
  return {
    id,
    targetUrl: "https://example.com",
    status: "queued",
    requirements: "Check the home page.",
    error: null,
    createdAt: "2026-11-21T08:00:00.000Z",
    startedAt: null,
    completedAt: null,
    testPlan: null,
  };
}

function createScenarioRow(
  id: string,
  runId: string,
): typeof scenarios.$inferInsert {
  return {
    id,
    runId,
    position: 0,
    language: "en",
    route: "/",
    viewportName: "Desktop",
    viewportWidth: 1440,
    viewportHeight: 900,
    status: "pending",
    result: null,
  };
}

describe("database", () => {
  beforeEach(() => {
    database.delete(scenarios).run();
    database.delete(runs).run();
  });

  it("should save a run and read it back", () => {
    const run = createRunRow("run-1");

    run.testPlan = {
      id: "plan-1",
      name: "Home page",
      description: "Check the home page.",
      steps: [
        {
          id: "step-1",
          action: "assert_url",
          expectedResult: "/",
        },
      ],
    };

    database.insert(runs).values(run).run();

    const savedRun = database
      .select()
      .from(runs)
      .where(eq(runs.id, "run-1"))
      .get();

    expect(savedRun).toEqual(run);
  });

  it("should save a scenario with its result as JSON", () => {
    const scenario = createScenarioRow("scenario-1", "run-1");

    scenario.status = "failed";
    scenario.result = {
      url: "https://example.com/",
      title: "Example Domain",
      consoleErrors: ["Failed to load resource"],
      pageErrors: [],
      failedRequests: [],
      buttons: [],
      inputs: [],
      error: "Login assertion failed",
      assertions: [
        {
          name: "assert_visible",
          passed: false,
          message: "Login button is not visible",
        },
      ],
      agentSteps: [
        {
          tool: "assert_visible",
          arguments: {
            role: "button",
            name: "Login",
          },
          success: true,
          passed: false,
          error: null,
        },
      ],
      agentSummary: null,
      failureAnalysis: null,
      screenshotPath: null,
    };

    database.insert(runs).values(createRunRow("run-1")).run();
    database.insert(scenarios).values(scenario).run();

    const savedScenario = database
      .select()
      .from(scenarios)
      .where(eq(scenarios.id, "scenario-1"))
      .get();

    expect(savedScenario).toEqual(scenario);
  });

  it("should refuse a scenario for a run that does not exist", () => {
    const scenario = createScenarioRow("scenario-1", "missing-run");

    expect(() => database.insert(scenarios).values(scenario).run()).toThrow(
      "FOREIGN KEY constraint failed",
    );
  });

  it("should delete the scenarios of a run when the run is deleted", () => {
    database.insert(runs).values(createRunRow("run-1")).run();
    database.insert(runs).values(createRunRow("run-2")).run();
    database
      .insert(scenarios)
      .values(createScenarioRow("scenario-1", "run-1"))
      .run();
    database
      .insert(scenarios)
      .values(createScenarioRow("scenario-2", "run-2"))
      .run();

    database.delete(runs).where(eq(runs.id, "run-1")).run();

    const remainingScenarios = database.select().from(scenarios).all();

    expect(remainingScenarios).toHaveLength(1);
    expect(remainingScenarios[0]?.id).toBe("scenario-2");
  });
});
