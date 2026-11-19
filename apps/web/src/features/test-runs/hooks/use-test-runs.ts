import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createTestRun, getTestRun, getTestRuns } from "../api/test-run-api";

import type { TestRunStatus } from "../types/test-run";
import { toTestRun } from "../utils/to-test-run";

const TEST_RUNS_KEY = ["test-runs"];

const DETAIL_REFRESH_INTERVAL = 1000;
const LIST_REFRESH_INTERVAL = 3000;

function isFinished(status: TestRunStatus): boolean {
  return (
    status === "completed" || status === "failed" || status === "cancelled"
  );
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
        (testRun) => !isFinished(testRun.status),
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
    refetchInterval: (query) => {
      if (query.state.status === "error") {
        return false;
      }

      const status = query.state.data?.status;

      if (status && isFinished(status)) {
        return false;
      }

      return DETAIL_REFRESH_INTERVAL;
    },
  });
}
