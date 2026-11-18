import { AppShell, Drawer, useMantineTheme } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Outlet } from "react-router";

import { AppSidebar } from "../../components/layout/app-sidebar";
import { AppHeader } from "../../components/layout/app-header";

const SIDEBAR_WIDTH = 260;
const HEADER_HEIGHT = 64;

export function AppLayout() {
  const [opened, handlers] = useDisclosure(false);

  const theme = useMantineTheme();

  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  // The drawer only exists on small screens, so treat it as closed on desktop.
  const drawerOpened = isMobile && opened;

  return (
    <AppShell
      header={{ height: { base: HEADER_HEIGHT, md: 0 } }}
      navbar={{
        width: SIDEBAR_WIDTH,
        breakpoint: "md",
        collapsed: { mobile: true },
      }}
    >
      {/* Top bar, mobile and tablet only */}
      <AppShell.Header hiddenFrom="md">
        <AppHeader menuOpened={drawerOpened} onMenuClick={handlers.open} />
      </AppShell.Header>

      {/* Desktop Sidebar */}
      <AppShell.Navbar visibleFrom="md" aria-label="Main">
        <AppSidebar />
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main bg="var(--app-page-bg)">
        <Outlet />
      </AppShell.Main>

      {/* Mobile / Tablet Navigation */}
      <Drawer.Root
        opened={drawerOpened}
        onClose={handlers.close}
        size={SIDEBAR_WIDTH}
      >
        <Drawer.Overlay />
        <Drawer.Content aria-label="Navigation">
          <nav aria-label="Main" style={{ height: "100%" }}>
            <AppSidebar onNavigate={handlers.close} />
          </nav>
        </Drawer.Content>
      </Drawer.Root>
    </AppShell>
  );
}
