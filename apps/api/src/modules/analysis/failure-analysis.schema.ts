import { z } from "zod";

const MAX_TEXT_LENGTH = 1000;

export const failureAnalysisSchema = z.strictObject({
  analysis: z.string().min(1).max(MAX_TEXT_LENGTH),
  suggestedAction: z.string().min(1).max(MAX_TEXT_LENGTH),
});

export type FailureAnalysis = z.infer<typeof failureAnalysisSchema>;
