import { Badge, Code, Paper, SimpleGrid, Stack, Text } from "@mantine/core";

import type { ApiScenarioResult } from "../../../types/api";

import { getAssertionDetails } from "../utils/get-assertion-details";

import { ScenarioScreenshot } from "./scenario-screenshot";

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

interface ScenarioDiagnosticPanelProps {
  runId: string;
  result: ApiScenarioResult;
}

export function ScenarioDiagnosticPanel({
  runId,
  result,
}: ScenarioDiagnosticPanelProps) {
  return (
    <Stack gap="md">
      {result.error && (
        <Stack gap={4}>
          <Text fw={600} size="sm" c="red">
            Execution Error
          </Text>

          <Code block>{result.error}</Code>
        </Stack>
      )}

      <Stack gap="xs">
        <Text fw={600} size="sm">
          Screenshot
        </Text>

        <ScenarioScreenshot
          runId={runId}
          scenarioId={result.scenarioId}
          hasScreenshot={Boolean(result.screenshotPath)}
        />
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <DiagnosticList title="Console Errors" items={result.consoleErrors} />

        <DiagnosticList title="Page Errors" items={result.pageErrors} />

        <DiagnosticList title="Failed Requests" items={result.failedRequests} />
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

                {getAssertionDetails(assertion.message).map((detail) => (
                  <Text size="sm" c="dimmed" key={detail}>
                    {detail}
                  </Text>
                ))}
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
              {input.placeholder ? ` · ${input.placeholder}` : ""}
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
  );
}
