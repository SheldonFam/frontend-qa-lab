import { Container, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";

import { ScenarioPreview } from "../components/scenario-preview";
import { TestConfigurationForm } from "../components/test-configuration-form";
import type { TestConfiguration } from "../types/test-configuration";
import type { TestScenario } from "../types/test-scenario";
import { generateScenarios } from "../utils/generate-scenarios";

export function TestConfigurationPage() {
  // Stored rather than derived: the preview shows the last submitted
  // configuration, and scenario ids must stay stable between renders.
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);

  function handleGenerate(configuration: TestConfiguration) {
    setScenarios(generateScenarios(configuration));
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Page Header */}
        <Stack gap={4}>
          <Title order={2}>New Test Run</Title>

          <Text size="sm" c="dimmed">
            Configure your frontend testing scenarios.
          </Text>
        </Stack>

        <TestConfigurationForm onSubmit={handleGenerate} />

        <ScenarioPreview scenarios={scenarios} />
      </Stack>
    </Container>
  );
}
