import type { LLMClient } from "../clients/llm.client.js";
import { testPlanOutputSchema } from "../schemas/test-plan.schema.js";
import type { TestPlan } from "../schemas/test-plan.schema.js";
import { createTestPlan } from "./test-plan.factory.js";
import { buildPlannerPrompt } from "./prompt-builder.js";
import type { PromptInput } from "./prompt-builder.js";

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
  /(reveal|show|print|leak).*(system|developer)\s+(prompt|message|instruction)/i,
  /\b(system|developer)\s+prompt\b/i,
  /\b(tool|function)\s*call\b/i,
  /\bexfiltrat(e|ion)\b/i,
  /\bdo\s+not\s+follow\s+the\s+rules\b/i,
  /\boverride\b.*\binstructions?\b/i,
];

function containsInjectionLikeContent(value: unknown): boolean {
  if (typeof value === "string") {
    return INJECTION_PATTERNS.some((pattern) => pattern.test(value));
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsInjectionLikeContent(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some((nestedValue) =>
      containsInjectionLikeContent(nestedValue),
    );
  }

  return false;
}

function assertSafeTestPlan(testPlan: TestPlan): void {
  if (containsInjectionLikeContent(testPlan)) {
    throw new Error("Unsafe test plan output detected");
  }
}

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
  const testPlan = processPlannerOutput(llmResponse);
  assertSafeTestPlan(testPlan);

  return testPlan;
}
