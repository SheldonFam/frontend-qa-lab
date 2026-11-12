import { useState } from "react";

import { Alert, Button, Code, Group, Stack, Text } from "@mantine/core";

import { Page } from "../../../components/layout/page";

import { ScenarioPreview } from "../components/scenario-preview";
import { TestConfigurationForm } from "../components/test-configuration-form";

import type { TestConfiguration } from "../types/test-configuration";
import type { TestScenario } from "../types/test-scenario";

import { generateScenarios } from "../utils/generate-scenarios";

import { useCreateTestRun } from "../../test-runs/hooks/use-test-runs";
import { useNavigate } from "react-router";

export function TestConfigurationPage() {
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);

  const [configuration, setConfiguration] = useState<TestConfiguration | null>(
    null,
  );

  const createTestRunMutation = useCreateTestRun();

  const navigate = useNavigate();

  // Step 1: Generate local scenarios for preview
  function handleGenerate(configuration: TestConfiguration) {
    setConfiguration(configuration);

    setScenarios(generateScenarios(configuration));

    // Reset previous API mutation state
    createTestRunMutation.reset();
  }

  // Step 2: Start the actual Backend Test Run
  function handleStartTestRun() {
    if (!configuration) {
      return;
    }

    createTestRunMutation.mutate(configuration, {
      onSuccess: (run) => {
        navigate(`/test-runs/${run.id}`);
      },
    });
  }

  return (
    <Page
      title="New Test Run"
      description="Configure your frontend testing scenarios."
    >
      {/* Step 1: Configuration Form */}
      <TestConfigurationForm onSubmit={handleGenerate} />

      {/* Step 2: Scenario Preview */}
      <ScenarioPreview scenarios={scenarios} />

      {/* Step 3: Start Test Run */}
      {configuration && (
        <Group justify="flex-end">
          <Button
            onClick={handleStartTestRun}
            loading={createTestRunMutation.isPending}
            disabled={createTestRunMutation.isSuccess}
          >
            Start Test Run
          </Button>
        </Group>
      )}

      {/* API Error */}
      {createTestRunMutation.isError && (
        <Alert color="red" title="Failed to create test run">
          {createTestRunMutation.error.message}
        </Alert>
      )}

      {/* API Success */}
      {createTestRunMutation.isSuccess && (
        <Alert color="green" title="Test run created successfully">
          <Stack gap="xs">
            <Text size="sm">
              Your test run has been accepted by the Backend.
            </Text>

            <Text size="sm">
              Run ID: <Code>{createTestRunMutation.data.id}</Code>
            </Text>

            <Text size="sm">
              Initial status: <Code>{createTestRunMutation.data.status}</Code>
            </Text>
          </Stack>
        </Alert>
      )}
    </Page>
  );
}
