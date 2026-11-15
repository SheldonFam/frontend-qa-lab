import type { LLMClient } from "./llm.client.js";
import type { PlannerPrompt } from "../service/prompt-builder.js";

export const mockLLMClient: LLMClient = {
  async generate(_prompt: PlannerPrompt): Promise<unknown> {
    return {
      name: "Login Functionality Test",
      description: "Verify the login functionality.",
      steps: [
        {
          action: "navigate",
          target: "/login",
        },
        {
          action: "assert_visible",
          target: "login form",
        },
        {
          action: "fill",
          target: "email input",
          value: "tester@example.com",
        },
        {
          action: "fill",
          target: "password input",
          value: "test-password",
        },
        {
          action: "click",
          target: "login button",
        },
        {
          action: "assert_url",
          expectedResult: "/dashboard",
        },
      ],
    };
  },
};
