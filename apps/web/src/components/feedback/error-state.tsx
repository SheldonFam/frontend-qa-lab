import { Button, Center, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <Center mih={300}>
      <Stack align="center" gap="sm" maw={400}>
        <ThemeIcon size={56} radius="xl" color="red" variant="light">
          <AlertCircle size={28} />
        </ThemeIcon>

        <Title order={3} size="h4">
          {title}
        </Title>

        <Text size="sm" c="dimmed" ta="center">
          {message}
        </Text>

        {onRetry && (
          <Button
            variant="light"
            leftSection={<RefreshCw size={16} />}
            onClick={onRetry}
          >
            Try again
          </Button>
        )}
      </Stack>
    </Center>
  );
}
