import { Burger, Group, Text } from "@mantine/core";

import { APP_NAME } from "../../constants/app";

interface AppHeaderProps {
  menuOpened: boolean;
  onMenuClick: () => void;
}

// Top bar with the menu button, shown on mobile and tablet only. On desktop
// the sidebar is always visible, so this bar is hidden.
export function AppHeader({ menuOpened, onMenuClick }: AppHeaderProps) {
  return (
    <Group h="100%" px="md" gap="md" wrap="nowrap">
      <Burger
        opened={menuOpened}
        onClick={onMenuClick}
        size="sm"
        aria-label="Open navigation"
        aria-expanded={menuOpened}
      />

      <Text fw={700}>{APP_NAME}</Text>
    </Group>
  );
}
