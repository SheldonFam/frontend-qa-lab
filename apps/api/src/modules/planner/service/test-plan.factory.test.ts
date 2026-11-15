import { describe, expect, it } from "vitest";
import { createTestPlan } from "./test-plan.factory.js";
import type { TestPlanOutput } from "../schemas/test-plan.schema.js";

describe("createTestPlan", () => {
  it("should generate unique IDs for plan and steps", () => {
    const output: TestPlanOutput = {
      name: "Login Test",
      description: "Verify login",
      steps: [
        {
          action: "navigate",
          target: "/login",
        },
        {
          action: "fill",
          target: "email input",
          value: "test@example.com",
        },
      ],
    };

    const result = createTestPlan(output);
    expect(result.id).toBeTypeOf("string");
    expect(result.id.length).toBeGreaterThan(0);

    // First step ID
    expect(result.steps[0].id).toBeTypeOf("string");

    // Second step ID
    expect(result.steps[1].id).toBeTypeOf("string");

    // IDs should be unique
    expect(result.steps[0].id).not.toBe(result.steps[1].id);

    // Original steps should not have IDs
    expect(output.steps[0]).not.toHaveProperty("id");
    expect(output.steps[1]).not.toHaveProperty("id");
  });
});
