import { describe, expect, it } from "vitest";
import { testPlanOutputSchema } from "../schemas/test-plan.schema.js";
import type { PlannerPrompt } from "../service/prompt-builder.js";
import { mockLLMClient } from "./mock-llm.client.js";

describe("mockLLMClient", () => {
  it("should return a valid test plan output", async () => {
    const prompt: PlannerPrompt = {
      systemPrompt: "You are a QA Test Planner.",
      userPrompt: "Test the login functionality.",
    };

    const result = await mockLLMClient.generate(prompt);

    const validation = testPlanOutputSchema.safeParse(result);

    expect(validation.success).toBe(true);
  });
});
