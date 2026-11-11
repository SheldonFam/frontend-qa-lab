import type { ReactNode } from "react";
import { Group, Title } from "@mantine/core";

interface AppHeaderProps {
  title: string;
  /** Rendered before the title, e.g. the mobile navigation toggle. */
  leftSection?: ReactNode;
}

export function AppHeader({ title, leftSection }: AppHeaderProps) {
  return (
    <header>
      <Group
        h={64}
        px={{ base: "md", sm: "xl" }}
        justify="flex-start"
        align="center"
        gap="md"
        bg="white"
        style={{ borderBottom: "1px solid #e9ecef" }}
      >
        {leftSection}

        <Title order={4}>{title}</Title>
      </Group>
    </header>
  );
}
