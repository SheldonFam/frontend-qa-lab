import { Button, Stack, Text, Title } from "@mantine/core";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { Page } from "../../../components/layout/page";
import { TestRunFilter } from "../components/test-run-filter";
import { TestRunStats } from "../components/test-run-stats";
import { TestRunTable } from "../components/test-run-table";
import type { TestRunStatusFilter } from "../types/test-run";
import { getTestRunStats } from "../utils/get-test-run-stats";
import { useTestRuns } from "../hooks/use-test-runs";
import { LoadingState } from "../../../components/feedback/loading-state";
import { EmptyState } from "../../../components/feedback/empty-state";
import { ErrorState } from "../../../components/feedback/error-state";

export function TestRunsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<TestRunStatusFilter>("all");

  const { data: testRuns, isPending, isError, refetch } = useTestRuns();

  // Handle loading state
  if (isPending) {
    return (
      <Page
        title="Test Runs"
        description="Monitor and manage your frontend test executions."
      >
        <LoadingState message="Loading test runs..." />
      </Page>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <Page
        title="Test Runs"
        description="Monitor and manage your frontend test executions."
      >
        <ErrorState
          title="Unable to load test runs"
          message="Something went wrong while fetching your test runs. Please try again."
          onRetry={() => {
            refetch();
          }}
        />
      </Page>
    );
  }

  // Data is available after the early returns
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredTestRuns = testRuns
    .filter((testRun) => {
      const nameMatch = testRun.name.toLowerCase().includes(normalizedQuery);

      const urlMatch = testRun.targetUrl
        .toLowerCase()
        .includes(normalizedQuery);

      const statusMatches =
        selectedStatus === "all" || testRun.status === selectedStatus;

      return (nameMatch || urlMatch) && statusMatches;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <Page
      title="Test Runs"
      description="Monitor and manage your frontend test executions."
      actions={
        <Button
          component={Link}
          to="/test-configuration"
          leftSection={<Plus size={16} strokeWidth={1.8} />}
        >
          New Test Run
        </Button>
      }
    >
      {/* Statistics */}
      <TestRunStats stats={getTestRunStats(testRuns)} />

      {/* Test Run History */}
      <Stack gap="md">
        <Stack gap={4}>
          <Title order={2} size="h4">
            Test Run History
          </Title>

          <Text size="sm" c="dimmed">
            View and filter your previous test executions.
          </Text>
        </Stack>

        {testRuns.length === 0 ? (
          <EmptyState
            title="No test runs yet"
            description="Create your first test run to see execution history here."
          />
        ) : (
          <>
            <TestRunFilter
              searchQuery={searchQuery}
              selectedStatus={selectedStatus}
              onSearchChange={setSearchQuery}
              onStatusChange={setSelectedStatus}
            />

            <Text size="sm" c="dimmed" role="status">
              Showing {filteredTestRuns.length} of {testRuns.length} test runs
            </Text>

            <TestRunTable filteredResults={filteredTestRuns} />
          </>
        )}
      </Stack>
    </Page>
  );
}
