import { Anchor, Badge, Button, Group, Stack, Title } from "@mantine/core";
import { Plus } from "lucide-react";
import { Link } from "react-router";

import { Page } from "../../../components/layout/page";
import { TestRunStats } from "../../test-runs/components/test-run-stats";
import { TestRunTable } from "../../test-runs/components/test-run-table";
import { mockTestRunsData } from "../../test-runs/data/mock-test-runs";
import { getTestRunStats } from "../../test-runs/utils/get-test-run-stats";

export function DashboardPage() {
  const recentTestRuns = mockTestRunsData
    .toSorted((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, 3);

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
      <TestRunStats stats={getTestRunStats(mockTestRunsData)} />

      <Stack gap="md">
        <Group justify="space-between">
          <Title order={2} size="h4">
            Recent Runs
          </Title>

          <Anchor component={Link} to="/test-runs" size="sm">
            View all runs
          </Anchor>
        </Group>

        <TestRunTable filteredResults={recentTestRuns} />
      </Stack>
    </Page>
  );
}
