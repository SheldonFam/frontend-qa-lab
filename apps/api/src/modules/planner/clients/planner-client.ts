import { env } from "../../../config/env.js";
import type { LLMClient } from "./llm.client.js";
import { mockLLMClient } from "./mock-llm.client.js";
import { openAILLMClient } from "./openai-llm.client.js";

export function getPlannerClient(): LLMClient {
  if (env.PLANNER_CLIENT === "openai") {
    return openAILLMClient;
  }

  return mockLLMClient;
}
