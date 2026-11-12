import { Center, Loader, Stack, Text } from "@mantine/core";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <Center style={{ minHeight: 300 }}>
      <Stack align="center" gap="sm">
        <Loader size="lg" />
        <Text size="sm" c="dimmed">
          {message}
        </Text>
      </Stack>
    </Center>
  );
}
