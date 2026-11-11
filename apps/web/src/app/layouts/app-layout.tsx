import { Box, Drawer, Flex } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Outlet } from "react-router";

import { AppSidebar } from "../../components/layout/app-sidebar";
import { AppHeader } from "../../components/layout/app-header";

export function AppLayout() {
  const [opened, handlers] = useDisclosure(false);

  const isMobile = useMediaQuery("(max-width: 991px)");

  // The drawer only exists on small screens, so treat it as closed on desktop.
  const drawerOpened = isMobile && opened;

  return (
    <Flex h="100dvh" bg="var(--app-page-bg)">
      {/* Desktop Sidebar */}
      <Box
        w={260}
        flex="0 0 260px"
        bg="var(--mantine-color-body)"
        visibleFrom="md"
        style={{ borderRight: "1px solid var(--app-border)" }}
      >
        <AppSidebar />
      </Box>

      {/* Main Content */}
      <Flex flex={1} direction="column" miw={0}>
        {/* Top bar, mobile and tablet only */}
        <AppHeader menuOpened={drawerOpened} onMenuClick={handlers.open} />

        <Box
          component="main"
          flex={1}
          miw={0}
          mih={0}
          style={{ overflow: "auto" }}
        >
          <Outlet />
        </Box>
      </Flex>

      {/* Mobile / Tablet Navigation */}
      <Drawer.Root opened={drawerOpened} onClose={handlers.close} size={260}>
        <Drawer.Overlay />
        <Drawer.Content aria-label="Navigation">
          <AppSidebar onNavigate={handlers.close} />
        </Drawer.Content>
      </Drawer.Root>
    </Flex>
  );
}
