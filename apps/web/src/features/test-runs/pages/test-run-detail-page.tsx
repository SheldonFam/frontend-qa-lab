import { Link, useParams } from "react-router";

import { Button, Group, Paper, Stack, Text, Title } from "@mantine/core";

import { Page } from "../../../components/layout/page";
import { ErrorState } from "../../../components/feedback/error-state";
import { LoadingState } from "../../../components/feedback/loading-state";

import { ExecutionSummaryCard } from "../components/execution-summary-card";
import { RunInformationCard } from "../components/run-information-card";
import { ScenarioResultsCard } from "../components/scenario-results-card";
import { TestPlanCard } from "../components/test-plan-card";
import { useTestRun } from "../hooks/use-test-runs";

export function TestRunDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: run, isPending, isError, error, refetch } = useTestRun(id);

  return (
    <Page
      title="Test Run Details"
      description="Monitor your test execution and view scenario results."
      actions={
        <Group>
          <Button component={Link} to="/test-runs" variant="default">
            Back to Test Runs
          </Button>

          <Button component={Link} to="/test-configuration">
            New Test Run
          </Button>
        </Group>
      }
    >
      {/* Loading State */}
      {isPending && <LoadingState message="Loading test run..." />}

      {/* Error State */}
      {isError && (
        <ErrorState
          title="Failed to load test run"
          message={error.message}
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {/* Run Data */}
      {run && (
        <Stack gap="lg">
          <RunInformationCard run={run} />

          {/* Testing Requirements */}
          <Paper withBorder radius="md" p="lg">
            <Stack gap="sm">
              <Title order={3}>Testing Requirements</Title>

              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                {run.requirements}
              </Text>
            </Stack>
          </Paper>

          <TestPlanCard testPlan={run.testPlan} runStatus={run.status} />

          <ExecutionSummaryCard run={run} />

          <ScenarioResultsCard
            runId={run.id}
            scenarios={run.scenarios}
            results={run.results}
          />
        </Stack>
      )}
    </Page>
  );
}
