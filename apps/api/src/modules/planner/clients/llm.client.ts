import type { PlannerPrompt } from "../service/prompt-builder.js";

export interface LLMClient {
  generate(prompt: PlannerPrompt): Promise<unknown>;
}
