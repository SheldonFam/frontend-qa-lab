import { describe, expect, it } from "vitest";

import type { TestScenario } from "../types/scenario.types.js";

import { getScenarioRoutes } from "./get-scenario-routes.js";

function createScenario(id: string, route: string): TestScenario {
  return {
    id,
    language: "en",
    route,
    viewport: {
      name: "desktop",
      width: 1280,
      height: 720,
    },
    status: "pending",
  };
}

describe("getScenarioRoutes", () => {
  it("should list each route once, in the order of the scenarios", () => {
    const routes = getScenarioRoutes([
      createScenario("scenario-1", "/en/login"),
      createScenario("scenario-2", "/en/login"),
      createScenario("scenario-3", "/ms/login"),
      createScenario("scenario-4", "/about"),
      createScenario("scenario-5", "/ms/login"),
    ]);

    expect(routes).toEqual(["/en/login", "/ms/login", "/about"]);
  });

  it("should return an empty list when there are no scenarios", () => {
    expect(getScenarioRoutes([])).toEqual([]);
  });
});
