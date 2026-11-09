import { Burger, Group, Title } from "@mantine/core";

interface AppHeaderProps {
  title: string;
  menuOpened: boolean;
  onMenuClick: () => void;
  showMenuButton: boolean;
}

export function AppHeader({
  title,
  menuOpened,
  onMenuClick,
  showMenuButton,
}: AppHeaderProps) {
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
        {showMenuButton && (
          <Burger
            opened={menuOpened}
            onClick={onMenuClick}
            size="sm"
            aria-label="Toggle navigation"
          />
        )}

        <Title order={4}>{title}</Title>
      </Group>
    </header>
  );
}
