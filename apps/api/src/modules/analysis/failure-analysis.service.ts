import OpenAI from "openai";
import { z } from "zod";

import { env } from "../../config/env.js";
import { getErrorSummary } from "../../utils/get-error-summary.js";

import {
  buildFailureAnalysisPrompt,
  type FailureAnalysisInput,
} from "./failure-analysis-prompt.js";
import {
  failureAnalysisSchema,
  type FailureAnalysis,
} from "./failure-analysis.schema.js";

let openai: OpenAI | undefined;

async function requestFailureAnalysis(
  input: FailureAnalysisInput,
): Promise<FailureAnalysis> {
  if (!openai) {
    openai = new OpenAI();
  }

  const prompt = buildFailureAnalysisPrompt(input);

  const response = await openai.responses.create({
    model: env.OPENAI_MODEL,
    instructions: prompt.systemPrompt,
    input: prompt.userPrompt,
    text: {
      format: {
        type: "json_schema",
        name: "failure_analysis",
        schema: z.toJSONSchema(failureAnalysisSchema, {
          target: "draft-7",
        }),
        strict: false,
      },
    },
  });

  if (response.status !== "completed") {
    throw new Error(
      `OpenAI response did not complete. Status: ${response.status}`,
    );
  }

  const output: unknown = JSON.parse(response.output_text);
  const analysis = failureAnalysisSchema.safeParse(output);

  if (!analysis.success) {
    throw new Error("The AI returned an analysis with the wrong fields");
  }

  return analysis.data;
}

export async function analyzeFailure(
  input: FailureAnalysisInput,
): Promise<FailureAnalysis | null> {
  if (env.PLANNER_CLIENT !== "openai") {
    return null;
  }

  try {
    return await requestFailureAnalysis(input);
  } catch (error: unknown) {
    console.warn(`AI failure analysis was skipped: ${getErrorSummary(error)}`);

    return null;
  }
}
