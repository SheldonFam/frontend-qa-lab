import { Group, Paper, Stack, Text, Title } from "@mantine/core";

import { StatusBadge } from "../../../components/status-badge";
import type { ApiTestRun } from "../../../types/api";
import { getScenarioCounts } from "../utils/get-scenario-counts";

interface RunInformationCardProps {
  run: ApiTestRun;
}

export function RunInformationCard({ run }: RunInformationCardProps) {
  const counts = getScenarioCounts(run.scenarios);

  return (
    <Paper withBorder radius="md" p="lg">
      <Stack gap="sm">
        <Title order={2} size="h3">
          Run Information
        </Title>

        <Text size="sm">Run ID: {run.id}</Text>

        <Text size="sm">Target URL: {run.targetUrl}</Text>

        <Group gap="xs">
          <Text size="sm">Status:</Text>
          <StatusBadge status={run.status} />
        </Group>

        {run.error && (
          <Text size="sm" c="red">
            Error: {run.error}
          </Text>
        )}

        <Text size="sm">Total Scenarios: {counts.total}</Text>

        <Text size="sm">Completed Scenarios: {counts.completed}</Text>
      </Stack>
    </Paper>
  );
}
