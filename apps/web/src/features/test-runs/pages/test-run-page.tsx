import { Button, Stack, Text, Title } from "@mantine/core";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { Page } from "../../../components/layout/page";
import { TestRunFilter } from "../components/test-run-filter";
import { TestRunStats } from "../components/test-run-stats";
import { TestRunTable } from "../components/test-run-table";
import { mockTestRunsData } from "../data/mock-test-runs";
import type { TestRunStatusFilter } from "../types/test-run";
import { getTestRunStats } from "../utils/get-test-run-stats";

export function TestRunsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<TestRunStatusFilter>("all");

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredTestRuns = mockTestRunsData.filter((testRun) => {
    const nameMatch = testRun.name.toLowerCase().includes(normalizedQuery);

    const urlMatch = testRun.targetUrl.toLowerCase().includes(normalizedQuery);

    const statusMatches =
      selectedStatus === "all" || testRun.status === selectedStatus;

    return (nameMatch || urlMatch) && statusMatches;
  });

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
      <TestRunStats stats={getTestRunStats(mockTestRunsData)} />

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

        <TestRunFilter
          searchQuery={searchQuery}
          selectedStatus={selectedStatus}
          onSearchChange={setSearchQuery}
          onStatusChange={setSelectedStatus}
        />

        {/* role="status" makes screen readers read out the new count */}
        <Text size="sm" c="dimmed" role="status">
          Showing {filteredTestRuns.length} of {mockTestRunsData.length} test
          runs
        </Text>

        <TestRunTable filteredResults={filteredTestRuns} />
      </Stack>
    </Page>
  );
}
