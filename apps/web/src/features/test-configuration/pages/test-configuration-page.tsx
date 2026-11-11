import { useState } from "react";

import { Page } from "../../../components/layout/page";
import { ScenarioPreview } from "../components/scenario-preview";
import { TestConfigurationForm } from "../components/test-configuration-form";
import type { TestConfiguration } from "../types/test-configuration";
import type { TestScenario } from "../types/test-scenario";
import { generateScenarios } from "../utils/generate-scenarios";

export function TestConfigurationPage() {
  // Saved when the form is submitted, so the preview shows the last submitted
  // settings, not what is currently being typed. (Generating them on every
  // render would also give each scenario a new random id each time.)
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);

  function handleGenerate(configuration: TestConfiguration) {
    setScenarios(generateScenarios(configuration));
  }

  return (
    <Page
      title="New Test Run"
      description="Configure your frontend testing scenarios."
    >
      <TestConfigurationForm onSubmit={handleGenerate} />

      <ScenarioPreview scenarios={scenarios} />
    </Page>
  );
}
