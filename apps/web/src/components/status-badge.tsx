import { Badge } from "@mantine/core";

import type { ApiRunStatus, ApiScenarioStatus } from "../types/api";

type Status = ApiScenarioStatus | ApiRunStatus;

const statusColors: Record<Status, string> = {
  // Scenario Status
  pending: "gray",
  passed: "green",

  // Run Status
  queued: "yellow",
  planning: "violet",
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
