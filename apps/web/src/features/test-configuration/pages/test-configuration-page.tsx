import { useRef, useState } from "react";

import { Alert, Button, Group, Textarea } from "@mantine/core";

import { Page } from "../../../components/layout/page";

import { ScenarioPreview } from "../components/scenario-preview";
import { TestConfigurationForm } from "../components/test-configuration-form";

import type { TestConfiguration } from "../types/test-configuration";

import { generateScenarios } from "../utils/generate-scenarios";

import { useCreateTestRun } from "../../test-runs/hooks/use-test-runs";
import { useNavigate } from "react-router";

export function TestConfigurationPage() {
  const [configuration, setConfiguration] = useState<TestConfiguration | null>(
    null,
  );

  const [requirements, setRequirements] = useState("");

  const scenarios = configuration ? generateScenarios(configuration) : [];

  const createTestRunMutation = useCreateTestRun();

  const navigate = useNavigate();

  const isStartingRef = useRef(false);

  // Step 1: Generate local scenarios for preview
  function handleGenerate(newConfiguration: TestConfiguration) {
    if (isStartingRef.current) {
      return;
    }

    setConfiguration(newConfiguration);

    // Reset previous API mutation state
    createTestRunMutation.reset();
  }

  function handleFormChange() {
    setConfiguration(null);
  }

  // Step 2: Start the actual Backend Test Run
  function handleStartTestRun() {
    if (!configuration || isStartingRef.current) {
      return;
    }

    isStartingRef.current = true;

    createTestRunMutation.mutate(
      { configuration, requirements: requirements.trim() },
      {
        onSuccess: (run) => {
          navigate(`/test-runs/${run.id}`);
        },
        onError: () => {
          isStartingRef.current = false;
        },
      },
    );
  }

  return (
    <Page
      title="New Test Run"
      description="Configure your frontend testing scenarios."
    >
      {/* Step 1: Configuration Form */}
      <TestConfigurationForm
        onSubmit={handleGenerate}
        onChange={handleFormChange}
      />

      {/* Step 2: Scenario Preview */}
      <ScenarioPreview scenarios={scenarios} />

      {configuration && (
        <Textarea
          label="Testing Requirements"
          description="Describe what you want the test planner to test."
          placeholder="e.g. Test login with valid and invalid credentials."
          minRows={4}
          autosize
          required
          value={requirements}
          onChange={(event) => setRequirements(event.currentTarget.value)}
        />
      )}

      {/* Step 3: Start Test Run */}
      {configuration && (
        <Group justify="flex-end">
          <Button
            onClick={handleStartTestRun}
            loading={createTestRunMutation.isPending}
            disabled={createTestRunMutation.isSuccess || !requirements.trim()}
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
    </Page>
  );
}
