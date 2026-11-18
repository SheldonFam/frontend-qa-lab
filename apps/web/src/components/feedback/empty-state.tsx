import { Center, EmptyState as MantineEmptyState } from "@mantine/core";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Center mih={200}>
      <MantineEmptyState size="sm">
        <MantineEmptyState.Title order={3}>{title}</MantineEmptyState.Title>

        <MantineEmptyState.Description>
          {description}
        </MantineEmptyState.Description>
      </MantineEmptyState>
    </Center>
  );
}
