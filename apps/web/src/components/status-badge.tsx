import { Badge } from "@mantine/core";

import type { TestScenarioStatus } from "../features/test-configuration/types/test-scenario";

const statusColors: Record<TestScenarioStatus, string> = {
  pending: "gray",
  running: "blue",
  passed: "green",
  failed: "red",
  skipped: "gray",
};

interface StatusBadgeProps {
  status: TestScenarioStatus;
}

// variant="dot" shows a small colored dot next to dark text. (With colored
// text instead, "passed" in green was too faint to read.)
export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge
      variant="dot"
      color={statusColors[status]}
      radius="sm"
      // Mantine's Badge cuts off text that doesn't fit. In a narrow table
      // column that shortens the label to "P…", so always show it in full.
      styles={{
        root: { overflow: "visible" },
        label: { overflow: "visible" },
      }}
    >
      {status}
    </Badge>
  );
}
