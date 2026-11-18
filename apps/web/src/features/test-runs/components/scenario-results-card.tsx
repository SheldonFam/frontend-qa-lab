import { Paper, Stack, Table, Title } from "@mantine/core";

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
      </Stack>
    </Paper>
  );
}
