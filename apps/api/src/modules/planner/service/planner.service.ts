import type { LLMClient } from "../clients/llm.client.js";
import { testPlanOutputSchema } from "../schemas/test-plan.schema.js";
import type { TestPlan } from "../schemas/test-plan.schema.js";
import { createTestPlan } from "./test-plan.factory.js";
import { buildPlannerPrompt } from "./prompt-builder.js";
import type { PromptInput } from "./prompt-builder.js";

export function processPlannerOutput(llmResponse: unknown): TestPlan {
  const result = testPlanOutputSchema.safeParse(llmResponse);

  if (!result.success) {
    throw new Error("Invalid test plan output");
  }

  const testPlan = createTestPlan(result.data);

  return testPlan;
}

export async function generateTestPlan(
  input: PromptInput,
  llmClient: LLMClient,
): Promise<TestPlan> {
  const prompt = buildPlannerPrompt(input);

  const llmResponse = await llmClient.generate(prompt);

  return processPlannerOutput(llmResponse);
}
