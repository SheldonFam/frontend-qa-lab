import type { LLMClient } from "./llm.client.js";
import type { PlannerPrompt } from "../service/prompt-builder.js";

export const mockLLMClient: LLMClient = {
  async generate(_prompt: PlannerPrompt): Promise<unknown> {
    return {
      name: "Sample plan (mock planner)",
      description:
        "The mock planner does not read the requirements. It only checks that the page shows a heading.",
      steps: [
        {
          action: "assert_visible",
          target: "main heading",
        },
      ],
    };
  },
};
