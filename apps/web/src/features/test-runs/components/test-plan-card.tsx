import { Badge, Paper, Stack, Table, Text, Title } from "@mantine/core";

import type {
  ApiRunStatus,
  ApiTestPlan,
  ApiTestPlanStep,
} from "../../../types/api";

interface TestPlanCardProps {
  testPlan: ApiTestPlan | null;
  runStatus: ApiRunStatus;
}

function getStepTarget(step: ApiTestPlanStep): string {
  if (step.action === "assert_url") {
    return step.expectedResult;
  }

  return step.target;
}

function getStepDetails(step: ApiTestPlanStep): string {
  if (step.action === "fill") {
    return step.value;
  }

  if (step.action === "assert_text") {
    return step.expectedResult;
  }

  return "—";
}

export function TestPlanCard({ testPlan, runStatus }: TestPlanCardProps) {
  return (
    <Paper withBorder radius="md" p="lg">
      <Stack gap="md">
        <Title order={3}>Generated Test Plan</Title>

        {testPlan ? (
          <>
            <Stack gap={4}>
              <Text fw={600}>{testPlan.name}</Text>

              <Text size="sm" c="dimmed">
                {testPlan.description}
              </Text>

              <Text size="xs" c="dimmed">
                {testPlan.steps.length} steps generated
              </Text>
            </Stack>

            <Table.ScrollContainer minWidth={600}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Step</Table.Th>
                    <Table.Th>Action</Table.Th>
                    <Table.Th>Target</Table.Th>
                    <Table.Th>Value / Expected Result</Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {testPlan.steps.map((step, index) => (
                    <Table.Tr key={step.id}>
                      <Table.Td>{index + 1}</Table.Td>

                      <Table.Td>
                        <Badge variant="light">{step.action}</Badge>
                      </Table.Td>

                      <Table.Td>{getStepTarget(step)}</Table.Td>

                      <Table.Td>{getStepDetails(step)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </>
        ) : (
          <Text size="sm" c="dimmed">
            {runStatus === "failed"
              ? "Test plan generation failed."
              : "The planner is generating a test plan..."}
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
