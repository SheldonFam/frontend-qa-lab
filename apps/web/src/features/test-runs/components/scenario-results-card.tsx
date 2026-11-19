import {
  Accordion,
  Badge,
  Code,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";

import { StatusBadge } from "../../../components/status-badge";
import type { ApiScenarioResult, ApiTestScenario } from "../../../types/api";

interface ScenarioResultsCardProps {
  scenarios: ApiTestScenario[];
  results: ApiScenarioResult[];
}

function getResultText(result: ApiScenarioResult | undefined): string {
  if (!result) {
    return "Waiting for execution...";
  }

  if (result.error) {
    return result.error;
  }

  return result.title ?? "—";
}

interface DiagnosticListProps {
  title: string;
  items: string[];
}

function DiagnosticList({ title, items }: DiagnosticListProps) {
  return (
    <Stack gap={4}>
      <Text fw={600} size="sm">
        {title} ({items.length})
      </Text>

      {items.length > 0 ? (
        <Stack gap={4}>
          {items.map((item, index) => (
            <Code block key={`${title}-${index}`}>
              {item}
            </Code>
          ))}
        </Stack>
      ) : (
        <Text size="sm" c="dimmed">
          None recorded
        </Text>
      )}
    </Stack>
  );
}

export function ScenarioResultsCard({
  scenarios,
  results,
}: ScenarioResultsCardProps) {
  return (
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
              {scenarios.map((scenario) => {
                const result = results.find(
                  (item) => item.scenarioId === scenario.id,
                );

                return (
                  <Table.Tr key={scenario.id}>
                    <Table.Td>{scenario.language}</Table.Td>

                    <Table.Td>{scenario.route}</Table.Td>

                    <Table.Td>{scenario.viewport.name}</Table.Td>

                    <Table.Td>
                      <StatusBadge status={scenario.status} />
                    </Table.Td>

                    <Table.Td>{getResultText(result)}</Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <Stack gap="sm">
          <Title order={4}>Diagnostic Details</Title>

          <Accordion variant="separated">
            {scenarios.map((scenario) => {
              const result = results.find(
                (item) => item.scenarioId === scenario.id,
              );

              if (!result) {
                return null;
              }

              return (
                <Accordion.Item value={scenario.id} key={scenario.id}>
                  <Accordion.Control>
                    <Stack gap={4}>
                      <Text fw={500} size="sm">
                        {scenario.language} · {scenario.route} ·{" "}
                        {scenario.viewport.name}
                      </Text>

                      <StatusBadge status={result.status} />
                    </Stack>
                  </Accordion.Control>

                  <Accordion.Panel>
                    <Stack gap="md">
                      {result.error && (
                        <Stack gap={4}>
                          <Text fw={600} size="sm" c="red">
                            Execution Error
                          </Text>

                          <Code block>{result.error}</Code>
                        </Stack>
                      )}

                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <DiagnosticList
                          title="Console Errors"
                          items={result.consoleErrors}
                        />

                        <DiagnosticList
                          title="Page Errors"
                          items={result.pageErrors}
                        />

                        <DiagnosticList
                          title="Failed Requests"
                          items={result.failedRequests}
                        />
                      </SimpleGrid>

                      <Stack gap="xs">
                        <Text fw={600} size="sm">
                          Assertions ({result.assertions.length})
                        </Text>

                        {result.assertions.length > 0 ? (
                          result.assertions.map((assertion, index) => (
                            <Paper
                              key={`${assertion.name}-${index}`}
                              withBorder
                              radius="sm"
                              p="sm"
                            >
                              <Stack gap={4}>
                                <Badge
                                  color={assertion.passed ? "green" : "red"}
                                  variant="light"
                                >
                                  {assertion.passed ? "Passed" : "Failed"}
                                </Badge>

                                <Text fw={500} size="sm">
                                  {assertion.name}
                                </Text>

                                <Text size="sm" c="dimmed">
                                  {assertion.message}
                                </Text>
                              </Stack>
                            </Paper>
                          ))
                        ) : (
                          <Text size="sm" c="dimmed">
                            No assertions recorded
                          </Text>
                        )}
                      </Stack>

                      <Stack gap="xs">
                        <Text fw={600} size="sm">
                          Detected Buttons ({result.buttons.length})
                        </Text>

                        {result.buttons.length > 0 ? (
                          result.buttons.map((button, index) => (
                            <Text size="sm" key={index}>
                              {button.text || "(Unnamed button)"} ·{" "}
                              {button.disabled ? "Disabled" : "Enabled"}
                            </Text>
                          ))
                        ) : (
                          <Text size="sm" c="dimmed">
                            No buttons detected
                          </Text>
                        )}
                      </Stack>

                      <Stack gap="xs">
                        <Text fw={600} size="sm">
                          Detected Inputs ({result.inputs.length})
                        </Text>

                        {result.inputs.length > 0 ? (
                          result.inputs.map((input, index) => (
                            <Text size="sm" key={index}>
                              {input.type}
                              {input.name ? ` · ${input.name}` : ""}
                              {input.placeholder
                                ? ` · ${input.placeholder}`
                                : ""}
                              {" · "}
                              {input.disabled ? "Disabled" : "Enabled"}
                            </Text>
                          ))
                        ) : (
                          <Text size="sm" c="dimmed">
                            No inputs detected
                          </Text>
                        )}
                      </Stack>

                      <Text size="xs" c="dimmed">
                        Final URL: {result.url}
                      </Text>
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </Stack>
      </Stack>
    </Paper>
  );
}
