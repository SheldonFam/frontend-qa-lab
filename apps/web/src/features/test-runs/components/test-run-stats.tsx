import { Card, SimpleGrid, Stack, Text } from "@mantine/core";

interface TestRunStatsProps {
  stats: {
    totalRuns: number;
    completedRuns: number;
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
      // "bright" is black in light mode and white in dark mode
      color: "bright",
    },
    {
      value: stats.completedRuns,
      label: "Completed",
      description: "Finished executions",
      color: "teal",
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
    <SimpleGrid cols={{ base: 2, lg: 4 }} spacing="md">
      {items.map((item) => (
        <Card key={item.label} padding="lg" withBorder radius="md">
          <Stack gap="xs">
            <Text size="sm" c="dimmed" fw={500}>
              {item.label}
            </Text>

            <Text fz={28} fw={700} lh={1.2} c={item.color}>
              {item.value}
            </Text>

            <Text size="xs" c="dimmed">
              {item.description}
            </Text>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}
