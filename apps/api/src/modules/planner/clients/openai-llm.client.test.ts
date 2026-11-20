import { beforeEach, describe, expect, it, vi } from "vitest";
import OpenAI from "openai";

import { InvalidTestPlanError } from "../service/invalid-test-plan-error.js";
import { generateTestPlan } from "../service/planner.service.js";
import type { PlannerPrompt } from "../service/prompt-builder.js";
import {
  createOpenAILLMClient,
  type OpenAIResponsesClient,
} from "./openai-llm.client.js";

const prompt: PlannerPrompt = {
  systemPrompt: "You are a QA Test Planner.",
  userPrompt: "Check the contact form.",
};

const planOutput = {
  name: "Contact form",
  description: "Check the contact form shows an error for an empty email.",
  steps: [
    {
      action: "click",
      target: "Send button",
      scope: {
        routes: ["/contact"],
      },
    },
    {
      action: "assert_visible",
      target: "Email is required message",
    },
  ],
};

function createMockOpenAI(response: unknown) {
  const create = vi.fn().mockResolvedValue(response);

  const openai = {
    responses: {
      create,
    },
  } as unknown as OpenAIResponsesClient;

  return { openai, create };
}

function createFailingOpenAI(error: unknown): OpenAIResponsesClient {
  return {
    responses: {
      create: vi.fn().mockRejectedValue(error),
    },
  } as unknown as OpenAIResponsesClient;
}

describe("openAILLMClient", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should send the prompt and ask for JSON in the plan schema", async () => {
    const { openai, create } = createMockOpenAI({
      status: "completed",
      output_text: JSON.stringify(planOutput),
    });

    const client = createOpenAILLMClient(openai, "test-model");

    await client.generate(prompt);

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "test-model",
        instructions: prompt.systemPrompt,
        input: prompt.userPrompt,
        text: {
          format: expect.objectContaining({
            type: "json_schema",
            name: "test_plan",
            strict: false,
            schema: expect.objectContaining({
              type: "object",
              required: ["name", "description", "steps"],
            }),
          }),
        },
      }),
    );
  });

  it("should return the plan that the model wrote", async () => {
    const { openai } = createMockOpenAI({
      status: "completed",
      output_text: JSON.stringify(planOutput),
    });

    const client = createOpenAILLMClient(openai, "test-model");

    await expect(client.generate(prompt)).resolves.toEqual(planOutput);
  });

  it("should produce a valid test plan through the planner service", async () => {
    const { openai } = createMockOpenAI({
      status: "completed",
      output_text: JSON.stringify(planOutput),
    });

    const client = createOpenAILLMClient(openai, "test-model");

    const testPlan = await generateTestPlan(
      {
        targetUrl: "https://example.com",
        languages: ["en"],
        routes: ["/contact"],
        viewports: [{ name: "Desktop", width: 1920, height: 1080 }],
        requirements: "Check the contact form.",
      },
      client,
    );

    expect(testPlan.name).toBe("Contact form");
    expect(testPlan.steps).toHaveLength(2);
    expect(testPlan.steps[0]?.id).toEqual(expect.any(String));
  });

  it("should fail clearly when the model does not return JSON", async () => {
    const { openai } = createMockOpenAI({
      status: "completed",
      output_text: "Sorry, I cannot help with that.",
    });

    const client = createOpenAILLMClient(openai, "test-model");

    await expect(client.generate(prompt)).rejects.toThrow(
      "The AI returned a plan that is not valid JSON",
    );
    await expect(client.generate(prompt)).rejects.toBeInstanceOf(
      InvalidTestPlanError,
    );
  });

  it("should fail when the response did not complete", async () => {
    const { openai } = createMockOpenAI({
      status: "incomplete",
      output_text: "",
    });

    const client = createOpenAILLMClient(openai, "test-model");

    await expect(client.generate(prompt)).rejects.toThrow(
      "OpenAI response did not complete. Status: incomplete",
    );
  });

  it("should hide the provider message when the usage limit is reached", async () => {
    const providerError = new OpenAI.APIError(
      429,
      undefined,
      "Rate limit reached in organization org-secret",
      undefined,
    );

    const client = createOpenAILLMClient(
      createFailingOpenAI(providerError),
      "test-model",
    );

    await expect(client.generate(prompt)).rejects.toThrow(
      "The AI service usage limit was reached. Try again later.",
    );
  });
});
