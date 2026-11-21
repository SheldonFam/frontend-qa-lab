import { Badge, Group, Stack, Text, Timeline } from "@mantine/core";

import type { ApiAgentStep } from "../../../types/api";

import { getStepDetails } from "../utils/get-step-details";
import { getStepOutcome } from "../utils/get-step-outcome";

interface AgentStepsProps {
  steps: ApiAgentStep[];
  summary: string | null;
}

export function AgentSteps({ steps, summary }: AgentStepsProps) {
  return (
    <Stack gap="xs">
      <Text fw={600} size="sm">
        Agent Steps ({steps.length})
      </Text>

      {steps.length > 0 ? (
        <Timeline active={steps.length - 1} lineWidth={2}>
          {steps.map((step, index) => {
            const outcome = getStepOutcome(step);
            const details = getStepDetails(step.arguments);
            const lines = step.error ? [step.error, ...details] : details;
            const description =
              lines.length > 0 ? lines.join(" · ") : "No details";

            return (
              <Timeline.Item
                key={index}
                color={outcome.color}
                title={
                  <Group gap="xs">
                    <Text fw={500} size="sm">
                      {index + 1}. {step.tool}
                    </Text>

                    <Badge color={outcome.color} variant="light">
                      {outcome.label}
                    </Badge>
                  </Group>
                }
              >
                <Text
                  size="sm"
                  c={step.error ? "red" : "dimmed"}
                  truncate="end"
                  title={description}
                >
                  {description}
                </Text>
              </Timeline.Item>
            );
          })}
        </Timeline>
      ) : (
        <Text size="sm" c="dimmed">
          No steps recorded
        </Text>
      )}

      {summary && (
        <Stack gap={4}>
          <Text fw={600} size="sm">
            Agent Summary
          </Text>

          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
            {summary}
          </Text>
        </Stack>
      )}
    </Stack>
  );
}
