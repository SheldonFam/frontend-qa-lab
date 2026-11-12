import { Badge } from "@mantine/core";

import type { TestScenarioStatus } from "../features/test-configuration/types/test-scenario";
import type { TestRunStatus } from "../features/test-runs/types/test-run";

type Status = TestScenarioStatus | TestRunStatus;

const statusColors: Record<Status, string> = {
  // Scenario Status
  pending: "gray",
  passed: "green",
  skipped: "gray",

  // Run Status
  queued: "yellow",
  running: "blue",
  completed: "teal",
  failed: "red",
  cancelled: "gray",
};

interface StatusBadgeProps {
  status: Status;
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
