import { Chip, Group, TextInput } from "@mantine/core";
import type { TestRun } from "../types/test-run";
import { Search } from "lucide-react";

type TestRunStatusFilter = "all" | TestRun["status"];

interface TestRunFilterProps {
  searchQuery: string;
  selectedStatus: TestRunStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TestRunStatusFilter) => void;
}

const filterChips = [
  { label: "All", value: "all" },
  { label: "Passed", value: "passed" },
  { label: "Failed", value: "failed" },
  { label: "Running", value: "running" },
];

export function TestRunFilter({
  searchQuery,
  selectedStatus,
  onSearchChange,
  onStatusChange,
}: TestRunFilterProps) {
  return (
    <Group align="center" justify="space-between" gap="md" wrap="wrap">
      <TextInput
        placeholder="Search test runs..."
        value={searchQuery}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
        leftSection={<Search size={18} strokeWidth={1.8} />}
        leftSectionPointerEvents="none"
        style={{ flex: "1 1 280px" }}
      />

      <Chip.Group value={selectedStatus} onChange={onStatusChange}>
        <Group gap="xs" wrap="wrap">
          {filterChips.map((chip) => (
            <Chip
              key={chip.value}
              value={chip.value}
              variant="light"
              icon={null}
            >
              {chip.label}
            </Chip>
          ))}
        </Group>
      </Chip.Group>
    </Group>
  );
}
