import type { ReactNode } from "react";
import { Container, Group, Stack, Text, Title } from "@mantine/core";

interface PageProps {
  title: string;
  description?: string;
  /** Buttons or badges shown next to the title. */
  actions?: ReactNode;
  children: ReactNode;
}

// Wraps every page: the same padding everywhere, the page heading (h1) with an
// optional description, and the browser tab title.
export function Page({ title, description, actions, children }: PageProps) {
  return (
    <Container size="xl" py={{ base: "md", sm: "xl" }}>
      {/* Browser tab title. React 19 moves this <title> into <head> for us. */}
      <title>{`${title} · Frontend QA Lab`}</title>

      <Stack gap="xl">
        <Group justify="space-between" align="flex-start" gap="md">
          <Stack gap={4}>
            <Title order={1} size="h2">
              {title}
            </Title>

            {description && (
              <Text size="sm" c="dimmed">
                {description}
              </Text>
            )}
          </Stack>

          {actions}
        </Group>

        {children}
      </Stack>
    </Container>
  );
}
