import { Anchor, Badge, Button, Group, Stack, Title } from "@mantine/core";
import { Plus } from "lucide-react";
import { Link } from "react-router";

import { Page } from "../../../components/layout/page";
import { LoadingState } from "../../../components/feedback/loading-state";
import { ErrorState } from "../../../components/feedback/error-state";
import { EmptyState } from "../../../components/feedback/empty-state";

import { TestRunStats } from "../../test-runs/components/test-run-stats";
import { TestRunTable } from "../../test-runs/components/test-run-table";
import { getTestRunStats } from "../../test-runs/utils/get-test-run-stats";
import { useTestRuns } from "../../test-runs/hooks/use-test-runs";

export function DashboardPage() {
  const { data: testRuns, isPending, isError, error, refetch } = useTestRuns();

  const recentTestRuns = testRuns
    ?.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <Page
      title="Overview"
      description="AI-powered frontend testing platform"
      actions={
        <Group gap="sm">
          <Badge color="blue" variant="light">
            Development
          </Badge>

          <Button
            component={Link}
            to="/test-configuration"
            leftSection={<Plus size={16} strokeWidth={1.8} />}
          >
            New Test Run
          </Button>
        </Group>
      }
    >
      {isPending && <LoadingState message="Loading dashboard..." />}

      {isError && (
        <ErrorState
          title="Failed to load dashboard"
          message={error.message}
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {testRuns && recentTestRuns && (
        <>
          {/* Statistics */}
          <TestRunStats stats={getTestRunStats(testRuns)} />

          {/* Recent Runs */}
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={2} size="h4">
                Recent Runs
              </Title>

              <Anchor component={Link} to="/test-runs" size="sm">
                View all runs
              </Anchor>
            </Group>

            {recentTestRuns.length === 0 ? (
              <EmptyState
                title="No test runs yet"
                description="Create your first test run to see recent executions here."
              />
            ) : (
              <TestRunTable filteredResults={recentTestRuns} />
            )}
          </Stack>
        </>
      )}
    </Page>
  );
}
