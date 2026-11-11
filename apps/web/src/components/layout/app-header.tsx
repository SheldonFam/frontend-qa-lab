import { Box, Burger, Group, Text } from "@mantine/core";

interface AppHeaderProps {
  menuOpened: boolean;
  onMenuClick: () => void;
}

// Top bar with the menu button, shown on mobile and tablet only. On desktop
// the sidebar is always visible, so this bar is hidden.
export function AppHeader({ menuOpened, onMenuClick }: AppHeaderProps) {
  return (
    <Box
      component="header"
      hiddenFrom="md"
      bg="var(--mantine-color-body)"
      style={{ borderBottom: "1px solid var(--app-border)" }}
    >
      <Group h={64} px="md" gap="md" wrap="nowrap">
        <Burger
          opened={menuOpened}
          onClick={onMenuClick}
          size="sm"
          aria-label="Open navigation"
          aria-expanded={menuOpened}
        />

        <Text fw={700}>Frontend QA Lab</Text>
      </Group>
    </Box>
  );
}
