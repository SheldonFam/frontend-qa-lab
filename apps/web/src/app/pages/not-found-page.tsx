import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <Center mih="60vh">
      <Stack align="center" gap="sm">
        <Title order={1}>404</Title>

        <Title order={3}>Page Not Found</Title>

        <Text c="dimmed" size="sm">
          The page you are looking for does not exist.
        </Text>

        <Button component={Link} to="/dashboard">
          Back to Dashboard
        </Button>
      </Stack>
    </Center>
  );
}
