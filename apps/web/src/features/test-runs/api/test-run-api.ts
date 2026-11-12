import type { TestConfiguration } from "../../test-configuration/types/test-configuration";

import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiTestRun,
} from "../types/test-run-api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export async function createTestRun(
  configuration: TestConfiguration,
): Promise<ApiTestRun> {
  const response = await fetch(`${API_BASE_URL}/runs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(configuration),
  });

  const body = (await response.json()) as
    | ApiSuccessResponse<ApiTestRun>
    | ApiErrorResponse;

  if (!response.ok || !body.success) {
    throw new Error(
      body.success
        ? `Failed to create test run (${response.status})`
        : body.error.message,
    );
  }

  return body.data;
}

export async function getTestRuns(): Promise<ApiTestRun[]> {
  const response = await fetch(`${API_BASE_URL}/runs`);

  const body = (await response.json()) as
    | ApiSuccessResponse<ApiTestRun[]>
    | ApiErrorResponse;

  if (!response.ok || !body.success) {
    throw new Error(
      body.success
        ? `Failed to fetch test runs (${response.status})`
        : body.error.message,
    );
  }

  return body.data;
}

export async function getTestRun(runId: string): Promise<ApiTestRun> {
  const response = await fetch(`${API_BASE_URL}/runs/${runId}`);

  const body = (await response.json()) as
    | ApiSuccessResponse<ApiTestRun>
    | ApiErrorResponse;

  if (!response.ok || !body.success) {
    throw new Error(
      body.success
        ? `Failed to fetch test run (${response.status})`
        : body.error.message,
    );
  }

  return body.data;
}
