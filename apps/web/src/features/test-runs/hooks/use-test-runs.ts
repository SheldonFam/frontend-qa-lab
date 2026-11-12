import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createTestRun, getTestRuns } from "../api/test-run-api";

import { toTestRun } from "../utils/to-test-run";

export function useCreateTestRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTestRun,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["test-runs"],
        exact: true,
      });
    },
  });
}

export function useTestRuns() {
  return useQuery({
    queryKey: ["test-runs"],
    queryFn: async () => {
      const apiRuns = await getTestRuns();
      return apiRuns.map(toTestRun);
    },
  });
}
