import { Accordion, Stack, Text, Title } from "@mantine/core";

import { StatusBadge } from "../../../components/status-badge";
import type { ApiScenarioResult, ApiTestScenario } from "../../../types/api";

import { ScenarioDiagnosticPanel } from "./scenario-diagnostic-panel";

interface ScenarioDiagnosticsProps {
  runId: string;
  scenarios: ApiTestScenario[];
  results: ApiScenarioResult[];
}

export function ScenarioDiagnostics({
  runId,
  scenarios,
  results,
}: ScenarioDiagnosticsProps) {
  return (
    <Stack gap="sm">
      <Title order={3} size="h4">
        Diagnostic Details
      </Title>

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
                    {scenario.language.toUpperCase()} · {scenario.route}
                    {" · "}
                    {scenario.viewport.name}
                  </Text>

                  <StatusBadge status={result.status} />
                </Stack>
              </Accordion.Control>

              <Accordion.Panel>
                <ScenarioDiagnosticPanel runId={runId} result={result} />
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Stack>
  );
}
