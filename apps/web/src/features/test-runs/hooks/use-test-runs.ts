import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "../api/api-error";
import {
  cancelTestRun,
  createTestRun,
  getTestRun,
  getTestRuns,
} from "../api/test-run-api";

import { isRunFinished } from "../utils/is-run-finished";
import { toTestRun } from "../utils/to-test-run";

const TEST_RUNS_KEY = ["test-runs"];

const DETAIL_REFRESH_INTERVAL = 1000;
const LIST_REFRESH_INTERVAL = 3000;

const MAX_RETRIES = 3;
const NOT_FOUND_STATUS = 404;

function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status === NOT_FOUND_STATUS) {
    return false;
  }

  return failureCount < MAX_RETRIES;
}

export function useCreateTestRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTestRun,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: TEST_RUNS_KEY,
        exact: true,
      });
    },
  });
}

export function useCancelTestRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelTestRun,

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: TEST_RUNS_KEY,
      });
    },
  });
}

export function useTestRuns() {
  return useQuery({
    queryKey: TEST_RUNS_KEY,
    queryFn: async () => {
      const apiRuns = await getTestRuns();
      const testRuns = apiRuns.map(toTestRun);

      return testRuns.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    },
    refetchInterval: (query) => {
      if (query.state.status === "error") {
        return false;
      }

      const testRuns = query.state.data ?? [];

      const hasRunInProgress = testRuns.some(
        (testRun) => !isRunFinished(testRun.status),
      );

      return hasRunInProgress ? LIST_REFRESH_INTERVAL : false;
    },
  });
}

export function useTestRun(id: string | undefined) {
  return useQuery({
    queryKey: [...TEST_RUNS_KEY, id],
    queryFn: () => {
      if (!id) {
        throw new Error("Test Run ID is missing");
      }

      return getTestRun(id);
    },
    enabled: Boolean(id),
    retry: shouldRetry,
    refetchInterval: (query) => {
      if (query.state.status === "error") {
        return false;
      }

      const status = query.state.data?.status;

      if (status && isRunFinished(status)) {
        return false;
      }

      return DETAIL_REFRESH_INTERVAL;
    },
  });
}
