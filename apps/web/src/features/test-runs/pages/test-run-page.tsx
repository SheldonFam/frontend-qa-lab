import { Container, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";

import { TestRunFilter } from "../components/test-run-filter";
import { TestRunStats } from "../components/test-run-stats";
import { TestRunTable } from "../components/test-run-table";
import { mockTestRunsData } from "../data/mock-test-runs";
import type { TestRun } from "../types/test-run";

type TestRunStatusFilter = "all" | TestRun["status"];

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

  const stats = {
    totalRuns: mockTestRunsData.length,
    passedRuns: mockTestRunsData.filter(
      (testRun) => testRun.status === "passed",
    ).length,
    failedRuns: mockTestRunsData.filter(
      (testRun) => testRun.status === "failed",
    ).length,
    runningRuns: mockTestRunsData.filter(
      (testRun) => testRun.status === "running",
    ).length,
  };

  return (
    <Container
      size="xl"
      py={{ base: "md", sm: "xl" }}
      px={{ base: "sm", sm: "md" }}
    >
      <Stack gap="xl">
        {/* Page Header */}
        <Stack gap={4}>
          <Title order={2}>Test Runs</Title>
          <Text size="sm" c="dimmed">
            Monitor and manage your frontend test executions.
          </Text>
        </Stack>

        {/* Statistics */}
        <TestRunStats stats={stats} />

        {/* Test Run History */}
        <Stack gap="md">
          <Stack gap={4}>
            <Title order={4}>Test Run History</Title>
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

          <TestRunTable filteredResults={filteredTestRuns} />
        </Stack>
      </Stack>
    </Container>
  );
}
