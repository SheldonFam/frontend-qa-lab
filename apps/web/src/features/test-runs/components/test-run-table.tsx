import {
  Badge,
  Box,
  Group,
  Progress,
  ScrollArea,
  Table,
  Text,
  Stack,
} from "@mantine/core";

import type { TestRun, TestRunStatus } from "../types/test-run";

interface TestRunTableProps {
  filteredResults: TestRun[];
}

const statusColors: Record<TestRunStatus, string> = {
  passed: "green",
  failed: "red",
  running: "blue",
};

function formatDuration(testRun: TestRun): string {
  if (testRun.status === "running") {
    return "In progress";
  }

  const minutes = Math.floor(testRun.duration / 60);
  const seconds = testRun.duration % 60;

  return `${minutes}m ${seconds}s`;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-MY", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

const tableColumns = [
  "Test Run",
  "Status",
  "Scenarios",
  "Languages",
  "Started At",
  "Duration",
];

export function TestRunTable({ filteredResults }: TestRunTableProps) {
  const rows = filteredResults.map((testRun) => {
    const completedScenarios =
      testRun.passedScenarios +
      testRun.failedScenarios +
      testRun.skippedScenarios;

    const progress =
      testRun.totalScenarios > 0
        ? (completedScenarios / testRun.totalScenarios) * 100
        : 0;

    return (
      <Table.Tr key={testRun.id}>
        {/* Test Run */}
        <Table.Td>
          <Stack gap={4}>
            <Text size="sm" fw={600}>
              {testRun.name}
            </Text>

            <Text size="xs" c="dimmed" truncate maw={220}>
              {testRun.targetUrl}
            </Text>
          </Stack>
        </Table.Td>

        {/* Status */}
        <Table.Td>
          <Badge
            color={statusColors[testRun.status]}
            variant="light"
            radius="sm"
            // Mantine's Badge clips its label (overflow: hidden), which lets the
            // table shrink this column until the text becomes "P…". Keep it full width.
            styles={{
              root: { overflow: "visible" },
              label: { overflow: "visible" },
            }}
          >
            {testRun.status}
          </Badge>
        </Table.Td>

        {/* Scenarios */}
        <Table.Td>
          <Stack gap={6} miw={160}>
            <Group justify="space-between" gap="xs">
              <Text size="sm" fw={500}>
                {completedScenarios} / {testRun.totalScenarios}
              </Text>

              <Text size="xs" c="dimmed">
                {Math.round(progress)}%
              </Text>
            </Group>

            <Progress value={progress} size="xs" radius="xl" />

            <Text size="xs" c="dimmed">
              {testRun.passedScenarios} passed · {testRun.failedScenarios}{" "}
              failed · {testRun.skippedScenarios} skipped
            </Text>
          </Stack>
        </Table.Td>

        {/* Languages */}
        <Table.Td>
          <Group gap={4}>
            {testRun.languages.map((language) => (
              <Badge key={language} variant="outline" color="gray" size="sm">
                {language.toUpperCase()}
              </Badge>
            ))}
          </Group>
        </Table.Td>

        {/* Started At */}
        <Table.Td>
          <Text size="sm" style={{ whiteSpace: "nowrap" }}>
            {formatDate(testRun.startedAt)}
          </Text>
        </Table.Td>

        {/* Duration */}
        <Table.Td>
          <Text
            size="sm"
            c={testRun.status === "running" ? "blue" : "dimmed"}
            style={{ whiteSpace: "nowrap" }}
          >
            {formatDuration(testRun)}
          </Text>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Box
      bg="white"
      style={{
        border: "1px solid var(--mantine-color-gray-3)",
        borderRadius: "var(--mantine-radius-md)",
      }}
    >
      <ScrollArea type="auto" offsetScrollbars>
        <Table
          striped
          highlightOnHover
          verticalSpacing="md"
          horizontalSpacing="lg"
          miw={900}
        >
          <Table.Thead>
            <Table.Tr>
              {tableColumns.map((column) => (
                <Table.Th key={column}>{column}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {filteredResults.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={tableColumns.length}>
                  <Box py={40}>
                    <Text size="sm" c="dimmed" ta="center">
                      No test runs found.
                    </Text>

                    <Text size="xs" c="dimmed" ta="center" mt={4}>
                      Try adjusting your search or filters.
                    </Text>
                  </Box>
                </Table.Td>
              </Table.Tr>
            ) : (
              rows
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Box>
  );
}
