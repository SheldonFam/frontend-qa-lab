import type { LLMClient } from "../clients/llm.client.js";
import { testPlanOutputSchema } from "../schemas/test-plan.schema.js";
import type { TestPlan } from "../schemas/test-plan.schema.js";
import { InvalidTestPlanError } from "./invalid-test-plan-error.js";
import { createTestPlan } from "./test-plan.factory.js";
import { buildPlannerPrompt } from "./prompt-builder.js";
import type { PlannerPrompt, PromptInput } from "./prompt-builder.js";

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
    throw new InvalidTestPlanError(
      "The AI plan was blocked because it contains unsafe text",
    );
  }
}

function assertPlanHasSteps(testPlan: TestPlan): void {
  if (testPlan.steps.length === 0) {
    throw new InvalidTestPlanError("The AI returned a plan with no steps");
  }
}

function assertScopeMatchesRun(testPlan: TestPlan, input: PromptInput): void {
  for (const step of testPlan.steps) {
    if (!step.scope) {
      continue;
    }

    for (const route of step.scope.routes ?? []) {
      if (!input.routes.includes(route)) {
        throw new InvalidTestPlanError(
          `The AI plan used a route that is not in this run: "${route}"`,
        );
      }
    }

    for (const language of step.scope.languages ?? []) {
      if (!input.languages.includes(language)) {
        throw new InvalidTestPlanError(
          `The AI plan used a language that is not in this run: "${language}"`,
        );
      }
    }
  }
}

export function processPlannerOutput(llmResponse: unknown): TestPlan {
  const result = testPlanOutputSchema.safeParse(llmResponse);

  if (!result.success) {
    throw new InvalidTestPlanError("Invalid test plan output");
  }

  const testPlan = createTestPlan(result.data);

  return testPlan;
}

async function requestTestPlan(
  prompt: PlannerPrompt,
  input: PromptInput,
  llmClient: LLMClient,
): Promise<TestPlan> {
  const llmResponse = await llmClient.generate(prompt);
  const testPlan = processPlannerOutput(llmResponse);

  assertPlanHasSteps(testPlan);
  assertScopeMatchesRun(testPlan, input);
  assertSafeTestPlan(testPlan);

  return testPlan;
}

export async function generateTestPlan(
  input: PromptInput,
  llmClient: LLMClient,
): Promise<TestPlan> {
  const prompt = buildPlannerPrompt(input);

  try {
    return await requestTestPlan(prompt, input, llmClient);
  } catch (error: unknown) {
    if (!(error instanceof InvalidTestPlanError)) {
      throw error;
    }

    console.warn(
      `The AI returned a bad plan (${error.message}). Trying one more time.`,
    );

    return requestTestPlan(prompt, input, llmClient);
  }
}
