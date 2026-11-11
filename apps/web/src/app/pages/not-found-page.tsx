import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <Center mih="60vh">
      <title>Page Not Found · Frontend QA Lab</title>

      <Stack align="center" gap="sm">
        <Text fz={34} fw={700} lh={1.3}>
          404
        </Text>

        <Title order={1} size="h3">
          Page Not Found
        </Title>

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
