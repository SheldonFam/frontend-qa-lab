import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";

import { Page } from "../../../components/layout/page";
import { LoadingState } from "../../../components/feedback/loading-state";

import { getTestRun } from "../api/test-run-api";

export function TestRunDetailPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: run,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["test-runs", id],
    queryFn: () => {
      if (!id) {
        throw new Error("Test Run ID is missing");
      }

      return getTestRun(id);
    },
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      if (
        status === "completed" ||
        status === "failed" ||
        status === "cancelled"
      ) {
        return false;
      }

      return 1000;
    },
  });

  // Execution statistics
  const totalScenarios = run?.scenarios.length ?? 0;
  const completedScenarios = run?.results.length ?? 0;

  const passedScenarios =
    run?.results.filter((result) => result.status === "passed").length ?? 0;

  const failedScenarios =
    run?.results.filter((result) => result.status === "failed").length ?? 0;

  // Execution Progress
  const executionProgress =
    totalScenarios > 0 ? (completedScenarios / totalScenarios) * 100 : 0;

  // Pass Rate: only available after the Run is completed
  const passRate =
    run?.status === "completed" && passedScenarios + failedScenarios > 0
      ? (passedScenarios / (passedScenarios + failedScenarios)) * 100
      : null;

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
        <Alert color="red" title="Failed to load test run">
          {error.message}
        </Alert>
      )}

      {/* Run Data */}
      {run && (
        <Stack gap="lg">
          {/* Run Information */}
          <Paper withBorder radius="md" p="lg">
            <Stack gap="sm">
              <Title order={3}>Run Information</Title>

              <Text size="sm">Run ID: {run.id}</Text>

              <Text size="sm">Target URL: {run.targetUrl}</Text>

              <Text size="sm">
                Status: <Badge>{run.status}</Badge>
              </Text>

              <Text size="sm">Total Scenarios: {totalScenarios}</Text>

              <Text size="sm">Completed Results: {completedScenarios}</Text>
            </Stack>
          </Paper>

          {/* Execution Summary */}
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
                    {completedScenarios} / {totalScenarios} completed
                  </Text>
                </Stack>

                {/* Passed */}
                <Stack gap={4}>
                  <Text size="xs" c="dimmed">
                    Passed
                  </Text>

                  <Text fw={700} size="xl" c="green">
                    {passedScenarios}
                  </Text>
                </Stack>

                {/* Failed */}
                <Stack gap={4}>
                  <Text size="xs" c="dimmed">
                    Failed
                  </Text>

                  <Text fw={700} size="xl" c="red">
                    {failedScenarios}
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

          {/* Scenario Results */}
          <Paper withBorder radius="md" p="lg">
            <Stack gap="md">
              <Title order={3}>Scenario Results</Title>

              <Table.ScrollContainer minWidth={600}>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Language</Table.Th>
                      <Table.Th>Route</Table.Th>
                      <Table.Th>Viewport</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Page Title / Error</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {run.scenarios.map((scenario) => {
                      const result = run.results.find(
                        (item) => item.scenarioId === scenario.id,
                      );

                      return (
                        <Table.Tr key={scenario.id}>
                          <Table.Td>{scenario.language}</Table.Td>

                          <Table.Td>{scenario.route}</Table.Td>

                          <Table.Td>{scenario.viewport.name}</Table.Td>

                          <Table.Td>
                            <Badge
                              color={
                                scenario.status === "passed"
                                  ? "green"
                                  : scenario.status === "failed"
                                    ? "red"
                                    : "gray"
                              }
                            >
                              {scenario.status}
                            </Badge>
                          </Table.Td>

                          <Table.Td>
                            {result?.title ??
                              result?.error ??
                              "Waiting for execution..."}
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Stack>
          </Paper>
        </Stack>
      )}
    </Page>
  );
}
