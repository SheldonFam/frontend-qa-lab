import { Badge, Paper, Stack, Table, Text, Title } from "@mantine/core";

import { StatusBadge } from "../../../components/status-badge";
import type { TestScenario } from "../types/test-scenario";

interface ScenarioPreviewProps {
  scenarios: TestScenario[];
}

export function ScenarioPreview({ scenarios }: ScenarioPreviewProps) {
  return (
    <Paper withBorder radius="md" p="lg">
      <Stack gap="md">
        <Title order={2} size="h4">
          Scenario Preview
        </Title>

        {/* role="status" makes screen readers read out the result */}
        <Text size="sm" c="dimmed" role="status">
          {scenarios.length === 0
            ? "No scenarios generated yet. Configure your test and click Generate Scenarios."
            : `Generated ${scenarios.length} scenarios.`}
        </Text>

        {scenarios.length > 0 && (
          <Table.ScrollContainer minWidth={800}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Language</Table.Th>
                  <Table.Th>Route</Table.Th>
                  <Table.Th>Viewport</Table.Th>
                  <Table.Th>Dimensions</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {scenarios.map((scenario, index) => (
                  <Table.Tr key={scenario.id}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>
                      <Badge variant="default" size="sm">
                        {scenario.language.toUpperCase()}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{scenario.route}</Table.Td>
                    <Table.Td>{scenario.viewport.name}</Table.Td>
                    <Table.Td>
                      {scenario.viewport.width} × {scenario.viewport.height}
                    </Table.Td>
                    <Table.Td>
                      <StatusBadge status={scenario.status} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Stack>
    </Paper>
  );
}
