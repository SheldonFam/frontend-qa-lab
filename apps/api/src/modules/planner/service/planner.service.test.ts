import { describe, expect, it } from "vitest";
import { generateTestPlan, processPlannerOutput } from "./planner.service.js";
import { PlannerPrompt, PromptInput } from "./prompt-builder.js";
import { mockLLMClient } from "../clients/mock-llm.client.js";
import { LLMClient } from "../clients/llm.client.js";

const promptInput: PromptInput = {
  targetUrl: "https://example.com",
  languages: ["English"],
  routes: ["/login"],
  viewports: [{ name: "Desktop", width: 1920, height: 1080 }],
  requirements: "Test login functionality.",
};

describe("processPlannerOutput", () => {
  it("should return a valid TestPlan with generated IDs", () => {
    // Arrange: Mock LLM response
    const mockLlmResponse = {
      name: "Login Test",
      description: "Verify login functionality",
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

    // Act: Process LLM response
    const result = processPlannerOutput(mockLlmResponse);

    // Assert: Verify generated TestPlan
    expect(result.id).toBeTypeOf("string");
    expect(result.id.length).toBeGreaterThan(0);

    expect(result.name).toBe("Login Test");
    expect(result.description).toBe("Verify login functionality");

    expect(result.steps).toHaveLength(2);

    // Verify generated Step IDs
    expect(result.steps[0].id).toBeTypeOf("string");
    expect(result.steps[1].id).toBeTypeOf("string");

    expect(result.steps[0].id).not.toBe(result.steps[1].id);
  });

  it("should throw an error when LLM response is invalid", () => {
    // Arrange: Mock invalid LLM response
    const mockLlmResponse = {
      name: "Login Test",
      description: "Verify login",
      steps: [
        {
          action: "fill",
          target: "email input",
          // Missing value
        },
      ],
    };

    // Act & Assert
    expect(() => processPlannerOutput(mockLlmResponse)).toThrow(
      "Invalid test plan output",
    );
  });

  it("should generate a test plan using the injected LLM client", async () => {
    const prompt: PlannerPrompt = {
      systemPrompt: "You are a QA Test Planner.",
      userPrompt: "Test the login functionality.",
    };

    const result = await generateTestPlan(promptInput, mockLLMClient);

    expect(result.name).toBe("Login Functionality Test");
    expect(result.id).toBeDefined();

    expect(result.steps.length).toBeGreaterThan(0);

    result.steps.forEach((step) => {
      expect(step.id).toBeDefined();
    });
  });

  it("should reject invalid LLM output", async () => {
    const prompt: PlannerPrompt = {
      systemPrompt: "You are a QA Test Planner.",
      userPrompt: "Test the login functionality.",
    };

    const invalidLLMClient: LLMClient = {
      async generate() {
        return {
          name: "Invalid Test Plan",
          description: "Invalid output",
          steps: [
            {
              action: "fill",
              target: "email input",
              // Missing required value
            },
          ],
        };
      },
    };

    await expect(
      generateTestPlan(promptInput, invalidLLMClient),
    ).rejects.toThrow("Invalid test plan output");
  });
});
