import OpenAI from "openai";

const RATE_LIMIT_STATUS = 429;
const UNAUTHORIZED_STATUS = 401;

export function getOpenAIErrorMessage(error: unknown): string {
  if (!(error instanceof OpenAI.APIError) || error.status === undefined) {
    return "Could not reach the AI service.";
  }

  if (error.status === RATE_LIMIT_STATUS) {
    return "The AI service usage limit was reached. Try again later.";
  }

  if (error.status === UNAUTHORIZED_STATUS) {
    return "The AI service rejected the API key.";
  }

  return `The AI service returned an error (${error.status}).`;
}
