import type {
  ApiCreateTestRunInput,
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiTestRun,
} from "../../../types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  const body = (await response.json()) as
    ApiSuccessResponse<T> | ApiErrorResponse;

  if (!body.success) {
    throw new Error(body.error.message);
  }

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
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
  return request<ApiTestRun>(`/runs/${runId}`);
}
