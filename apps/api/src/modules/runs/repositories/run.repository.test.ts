import { beforeEach, describe, expect, it } from "vitest";

import { runRepository } from "./run.repository.js";

import type { RunStatus, TestRun } from "../types/run.types.js";
import type { ScenarioResult, TestScenario } from "../types/scenario.types.js";

function createScenario(id: string): TestScenario {
  return {
    id,
    language: "en",
    route: "/",
    viewport: {
      name: "desktop",
      width: 1280,
      height: 720,
    },
    status: "pending",
  };
}

function createTestRun(id: string, scenarios: TestScenario[]): TestRun {
  return {
    id,
    targetUrl: "https://example.com",
    status: "queued",
    createdAt: "2026-11-21T08:00:00.000Z",
    startedAt: null,
    completedAt: null,
    scenarios,
    results: [],
    requirements: "Test website functionality",
    testPlan: null,
    error: null,
  };
}

function createResult(
  scenarioId: string,
  status: ScenarioResult["status"],
): ScenarioResult {
  return {
    scenarioId,
    status,
    url: "https://example.com/",
    title: "Example Domain",
    consoleErrors: ["Failed to load resource"],
    pageErrors: [],
    failedRequests: [],
    buttons: [
      {
        text: "Login",
        disabled: false,
      },
    ],
    inputs: [],
    error: status === "failed" ? "Login assertion failed" : null,
    assertions: [
      {
        name: "assert_visible",
        passed: status === "passed",
        message: "Login button",
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
        passed: status === "passed",
        error: null,
      },
    ],
    agentSummary: "Checked the Login button.",
    failureAnalysis: null,
    screenshotPath: null,
  };
}

describe("runRepository", () => {
  beforeEach(() => {
    runRepository.clear();
  });

  it("should save a run and read it back", () => {
    const testRun = createTestRun("run-001", [
      createScenario("scenario-001"),
      createScenario("scenario-002"),
    ]);

    runRepository.create(testRun);

    expect(runRepository.findById("run-001")).toEqual(testRun);
  });

  it("should return undefined when the run does not exist", () => {
    expect(runRepository.findById("missing-run")).toBeUndefined();
  });

  it("should keep the scenarios in the order they were saved", () => {
    const testRun = createTestRun("run-001", [
      createScenario("scenario-c"),
      createScenario("scenario-a"),
      createScenario("scenario-b"),
    ]);

    runRepository.create(testRun);

    const scenarioIds = runRepository
      .findById("run-001")
      ?.scenarios.map((scenario) => scenario.id);

    expect(scenarioIds).toEqual(["scenario-c", "scenario-a", "scenario-b"]);
  });

  it("should not save a run when one of its scenarios cannot be saved", () => {
    const testRun = createTestRun("run-001", [
      createScenario("scenario-001"),
      createScenario("scenario-001"),
    ]);

    expect(() => runRepository.create(testRun)).toThrow(
      "UNIQUE constraint failed",
    );
    expect(runRepository.findAll()).toEqual([]);
  });

  it("should return all runs with the oldest first", () => {
    const olderRun = createTestRun("run-001", [createScenario("scenario-001")]);
    const newerRun = createTestRun("run-002", [createScenario("scenario-002")]);

    olderRun.createdAt = "2026-11-20T08:00:00.000Z";
    newerRun.createdAt = "2026-11-21T08:00:00.000Z";

    runRepository.create(newerRun);
    runRepository.create(olderRun);

    expect(runRepository.findAll()).toEqual([olderRun, newerRun]);
  });

  it("should update a run", () => {
    const testRun = createTestRun("run-001", [createScenario("scenario-001")]);

    runRepository.create(testRun);

    runRepository.update("run-001", {
      status: "failed",
      startedAt: "2026-11-21T08:01:00.000Z",
      completedAt: "2026-11-21T08:02:00.000Z",
      error: "Browser launch failed",
      testPlan: {
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
      },
    });

    const updatedRun = runRepository.findById("run-001");

    expect(updatedRun?.status).toBe("failed");
    expect(updatedRun?.startedAt).toBe("2026-11-21T08:01:00.000Z");
    expect(updatedRun?.completedAt).toBe("2026-11-21T08:02:00.000Z");
    expect(updatedRun?.error).toBe("Browser launch failed");
    expect(updatedRun?.testPlan?.name).toBe("Home page");
    expect(updatedRun?.scenarios).toEqual(testRun.scenarios);
  });

  it("should add a scenario result and update the scenario status", () => {
    const result = createResult("scenario-001", "failed");

    runRepository.create(
      createTestRun("run-001", [
        createScenario("scenario-001"),
        createScenario("scenario-002"),
      ]),
    );

    runRepository.addScenarioResult("run-001", result);

    const run = runRepository.findById("run-001");

    expect(run?.results).toEqual([result]);
    expect(run?.scenarios[0]?.status).toBe("failed");
    expect(run?.scenarios[1]?.status).toBe("pending");
  });

  it("should add multiple scenario results to an existing run", () => {
    const result1 = createResult("scenario-001", "passed");
    const result2 = createResult("scenario-002", "failed");

    runRepository.create(
      createTestRun("run-001", [
        createScenario("scenario-001"),
        createScenario("scenario-002"),
      ]),
    );

    runRepository.addScenarioResult("run-001", result1);
    runRepository.addScenarioResult("run-001", result2);

    const run = runRepository.findById("run-001");

    expect(run?.results).toEqual([result1, result2]);
  });

  it("should throw an error when the run does not exist", () => {
    expect(() => {
      runRepository.addScenarioResult(
        "invalid-id",
        createResult("scenario-001", "passed"),
      );
    }).toThrow("Scenario not found in this run");
  });

  it("should throw an error when the scenario belongs to another run", () => {
    runRepository.create(
      createTestRun("run-001", [createScenario("scenario-001")]),
    );
    runRepository.create(
      createTestRun("run-002", [createScenario("scenario-002")]),
    );

    expect(() => {
      runRepository.addScenarioResult(
        "run-001",
        createResult("scenario-002", "passed"),
      );
    }).toThrow("Scenario not found in this run");

    expect(runRepository.findById("run-002")?.results).toEqual([]);
  });

  it("should mark only the unfinished runs as failed", () => {
    const statuses: RunStatus[] = [
      "queued",
      "planning",
      "running",
      "completed",
      "failed",
      "cancelled",
    ];

    for (const status of statuses) {
      const testRun = createTestRun(`run-${status}`, []);

      testRun.status = status;

      runRepository.create(testRun);
    }

    runRepository.failUnfinishedRuns("The API restarted.");

    for (const status of ["queued", "planning", "running"]) {
      const run = runRepository.findById(`run-${status}`);

      expect(run?.status).toBe("failed");
      expect(run?.error).toBe("The API restarted.");
      expect(run?.completedAt).not.toBeNull();
    }

    expect(runRepository.findById("run-completed")?.status).toBe("completed");
    expect(runRepository.findById("run-cancelled")?.status).toBe("cancelled");
    expect(runRepository.findById("run-failed")?.error).toBeNull();
  });

  it("should remove every run and its scenarios", () => {
    const scenario = createScenario("scenario-001");

    runRepository.create(createTestRun("run-001", [scenario]));
    runRepository.clear();

    expect(runRepository.findAll()).toEqual([]);

    runRepository.create(createTestRun("run-002", [scenario]));

    expect(runRepository.findById("run-002")?.scenarios).toEqual([scenario]);
  });
});
