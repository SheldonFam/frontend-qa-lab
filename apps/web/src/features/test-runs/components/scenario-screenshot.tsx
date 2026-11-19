import { useState } from "react";

import { Text } from "@mantine/core";

import { getScenarioScreenshotUrl } from "../api/test-run-api";

interface ScenarioScreenshotProps {
  runId: string;
  scenarioId: string;
  hasScreenshot: boolean;
}

export function ScenarioScreenshot({
  runId,
  scenarioId,
  hasScreenshot,
}: ScenarioScreenshotProps) {
  const [hasError, setHasError] = useState(false);

  if (!hasScreenshot) {
    return (
      <Text size="sm" c="dimmed">
        No screenshot available
      </Text>
    );
  }

  if (hasError) {
    return (
      <Text size="sm" c="red">
        Failed to load screenshot
      </Text>
    );
  }

  return (
    <img
      src={getScenarioScreenshotUrl(runId, scenarioId)}
      alt={`Screenshot for scenario ${scenarioId}`}
      onError={() => setHasError(true)}
      style={{
        display: "block",
        width: "100%",
        maxWidth: "800px",
        height: "auto",
        borderRadius: "8px",
        border: "1px solid var(--mantine-color-default-border)",
      }}
    />
  );
}
