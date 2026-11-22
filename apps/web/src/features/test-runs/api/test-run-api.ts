import type {
  ApiCreateTestRunInput,
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiTestRun,
} from "../../../types/api";

import { ApiError } from "./api-error";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new Error("Cannot reach the server. Check that the API is running.");
  }

  let body: ApiSuccessResponse<T> | ApiErrorResponse;

  try {
    body = (await response.json()) as ApiSuccessResponse<T> | ApiErrorResponse;
  } catch {
    throw new Error(
      `The server sent an unexpected answer (${response.status}).`,
    );
  }

  if (!body.success) {
    throw new ApiError(body.error.message, response.status);
  }

  if (!response.ok) {
    throw new ApiError(`Request failed (${response.status})`, response.status);
  }

  return body.data;
}

export function createTestRun(
  input: ApiCreateTestRunInput,
): Promise<ApiTestRun> {
  return request<ApiTestRun>("/runs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function getTestRuns(): Promise<ApiTestRun[]> {
  return request<ApiTestRun[]>("/runs");
}

export function getTestRun(runId: string): Promise<ApiTestRun> {
  return request<ApiTestRun>(`/runs/${encodeURIComponent(runId)}`);
}

export function cancelTestRun(runId: string): Promise<ApiTestRun> {
  return request<ApiTestRun>(`/runs/${encodeURIComponent(runId)}/cancel`, {
    method: "POST",
  });
}

export function getScenarioScreenshotUrl(
  runId: string,
  scenarioId: string,
): string {
  const baseUrl = API_BASE_URL.replace(/\/$/, "");

  return `${baseUrl}/runs/${encodeURIComponent(runId)}/scenarios/${encodeURIComponent(scenarioId)}/screenshot`;
}
