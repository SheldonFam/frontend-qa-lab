import { Center, Stack, Text, Title } from "@mantine/core";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Center mih={200}>
      <Stack align="center" gap="xs">
        <Title order={3} size="h5">
          {title}
        </Title>

        <Text size="sm" c="dimmed" ta="center">
          {description}
        </Text>
      </Stack>
    </Center>
  );
}
