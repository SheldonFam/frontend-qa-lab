import OpenAI from "openai";
import { z } from "zod";

import { env } from "../../../config/env.js";
import { getOpenAIErrorMessage } from "../../../utils/get-openai-error-message.js";
import { testPlanOutputSchema } from "../schemas/test-plan.schema.js";
import { InvalidTestPlanError } from "../service/invalid-test-plan-error.js";
import type { LLMClient } from "./llm.client.js";

export type OpenAIResponsesClient = Pick<OpenAI, "responses">;

function parsePlanText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new InvalidTestPlanError(
      "The AI returned a plan that is not valid JSON",
    );
  }
}

export function createOpenAILLMClient(
  openai: OpenAIResponsesClient,
  modelName: string,
): LLMClient {
  return {
    async generate(prompt) {
      const response = await openai.responses
        .create({
          model: modelName,
          instructions: prompt.systemPrompt,
          input: prompt.userPrompt,
          text: {
            format: {
              type: "json_schema",
              name: "test_plan",
              schema: z.toJSONSchema(testPlanOutputSchema, {
                target: "draft-7",
              }),
              strict: false,
            },
          },
        })
        .catch((error: unknown) => {
          console.error("OpenAI request failed:", error);

          throw new Error(getOpenAIErrorMessage(error));
        });

      if (response.status !== "completed") {
        throw new Error(
          `OpenAI response did not complete. Status: ${response.status}`,
        );
      }

      return parsePlanText(response.output_text);
    },
  };
}

let defaultClient: LLMClient | undefined;

export const openAILLMClient: LLMClient = {
  generate(prompt) {
    if (!defaultClient) {
      defaultClient = createOpenAILLMClient(new OpenAI(), env.OPENAI_MODEL);
    }

    return defaultClient.generate(prompt);
  },
};
