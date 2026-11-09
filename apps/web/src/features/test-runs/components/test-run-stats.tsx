import { Card, SimpleGrid, Stack, Text, Title } from "@mantine/core";

interface TestRunStatsProps {
  stats: {
    totalRuns: number;
    passedRuns: number;
    failedRuns: number;
    runningRuns: number;
  };
}

export function TestRunStats({ stats }: TestRunStatsProps) {
  const items = [
    {
      value: stats.totalRuns,
      label: "Total Runs",
      description: "All executions",
      color: "dark",
    },
    {
      value: stats.passedRuns,
      label: "Passed",
      description: "Successful runs",
      color: "green",
    },
    {
      value: stats.failedRuns,
      label: "Failed",
      description: "Runs with failures",
      color: "red",
    },
    {
      value: stats.runningRuns,
      label: "Running",
      description: "Currently executing",
      color: "blue",
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md">
      {items.map((item) => (
        <Card key={item.label} padding="lg" withBorder radius="md">
          <Stack gap="xs">
            <Text size="sm" c="dimmed" fw={500}>
              {item.label}
            </Text>

            <Title order={2} c={item.color}>
              {item.value}
            </Title>

            <Text size="xs" c="dimmed">
              {item.description}
            </Text>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}
