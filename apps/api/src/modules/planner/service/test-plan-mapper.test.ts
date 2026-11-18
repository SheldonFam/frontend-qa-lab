import { describe, expect, it } from "vitest";

import { mapTestPlanToScenario } from "./test-plan-mapper.js";
import { testPlanSchema } from "../schemas/test-plan.schema.js";

import type { TestScenario } from "../../runs/types/scenario.types.js";

const testPlan = testPlanSchema.parse({
  id: "plan-1",
  name: "Frontend QA Test Plan",
  description: "Test multiple routes and languages",
  steps: [
    {
      id: "step-1",
      action: "assert_visible",
      target: "header",
    },
    {
      id: "step-2",
      action: "assert_text",
      target: "h1",
      expectedResult: "Login",
      scope: {
        routes: ["/login"],
      },
    },
    {
      id: "step-3",
      action: "assert_text",
      target: "h1",
      expectedResult: "Welcome",
      scope: {
        languages: ["en"],
      },
    },
    {
      id: "step-4",
      action: "assert_visible",
      target: "button",
      scope: {
        routes: ["/login"],
        languages: ["en"],
      },
    },
  ],
});

const scenario: TestScenario = {
  id: "scenario-1",
  language: "en",
  route: "/login",
  viewport: {
    name: "desktop",
    width: 1280,
    height: 720,
  },
  status: "pending",
};

describe("mapTestPlanToScenario", () => {
  it("should include global steps", () => {
    const result = mapTestPlanToScenario(testPlan, {
      ...scenario,
      route: "/dashboard",
      language: "ms",
    });

    expect(result.steps.map((step) => step.id)).toEqual(["step-1"]);
  });

  it("should include steps matching the route", () => {
    const result = mapTestPlanToScenario(testPlan, {
      ...scenario,
      language: "ms",
    });

    expect(result.steps.map((step) => step.id)).toEqual(["step-1", "step-2"]);
  });

  it("should include steps matching the language", () => {
    const result = mapTestPlanToScenario(testPlan, {
      ...scenario,
      route: "/dashboard",
    });

    expect(result.steps.map((step) => step.id)).toEqual(["step-1", "step-3"]);
  });

  it("should require both route and language to match", () => {
    const result = mapTestPlanToScenario(testPlan, scenario);

    expect(result.steps.map((step) => step.id)).toEqual([
      "step-1",
      "step-2",
      "step-3",
      "step-4",
    ]);
  });

  it("should preserve the original test plan metadata", () => {
    const result = mapTestPlanToScenario(testPlan, scenario);

    expect(result.id).toBe(testPlan.id);
    expect(result.name).toBe(testPlan.name);
    expect(result.description).toBe(testPlan.description);
  });
});
