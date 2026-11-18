import { Paper, Progress, SimpleGrid, Stack, Text, Title } from "@mantine/core";

import type { ApiTestRun } from "../../../types/api";
import { getScenarioCounts } from "../utils/get-scenario-counts";

interface ExecutionSummaryCardProps {
  run: ApiTestRun;
}

export function ExecutionSummaryCard({ run }: ExecutionSummaryCardProps) {
  const counts = getScenarioCounts(run.scenarios);

  // Execution Progress
  const executionProgress =
    counts.total > 0 ? (counts.completed / counts.total) * 100 : 0;

  // Pass Rate: only available after the Run is completed
  const passRate =
    run.status === "completed" && counts.completed > 0
      ? (counts.passed / counts.completed) * 100
      : null;

  return (
    <Paper withBorder radius="md" p="lg">
      <Stack gap="md">
        <Title order={3}>Execution Summary</Title>

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          {/* Execution Progress */}
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              Execution Progress
            </Text>

            <Text fw={700} size="xl">
              {Math.round(executionProgress)}%
            </Text>

            <Progress value={executionProgress} size="sm" />

            <Text size="xs" c="dimmed">
              {counts.completed} / {counts.total} completed
            </Text>
          </Stack>

          {/* Passed */}
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              Passed
            </Text>

            <Text fw={700} size="xl" c="green">
              {counts.passed}
            </Text>
          </Stack>

          {/* Failed */}
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              Failed
            </Text>

            <Text fw={700} size="xl" c="red">
              {counts.failed}
            </Text>
          </Stack>

          {/* Pass Rate */}
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              Pass Rate
            </Text>

            <Text fw={700} size="xl">
              {passRate === null ? "—" : `${Math.round(passRate)}%`}
            </Text>

            {passRate === null && (
              <Text size="xs" c="dimmed">
                Available after completion
              </Text>
            )}
          </Stack>
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
