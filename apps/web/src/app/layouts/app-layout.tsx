import { Box, Burger, Drawer, Flex } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Outlet, useLocation } from "react-router";

import { AppSidebar } from "../../components/layout/app-sidebar";
import { AppHeader } from "../../components/layout/app-header";
import { navigationItems } from "../../components/layout/navigation-items";

export function AppLayout() {
  const location = useLocation();

  const [opened, handlers] = useDisclosure(false);

  const isMobile = useMediaQuery("(max-width: 991px)");

  // The drawer is mobile-only, so it is never open on desktop.
  const drawerOpened = isMobile && opened;

  const pageTitle =
    navigationItems.find((item) => item.href === location.pathname)?.label ??
    "Frontend QA Lab";

  return (
    <Flex h="100vh" bg="gray.0">
      {/* Desktop Sidebar */}
      <Box
        component="aside"
        w={260}
        flex="0 0 260px"
        h="100vh"
        bg="dark.7"
        visibleFrom="md"
      >
        <AppSidebar />
      </Box>

      {/* Main Content */}
      <Flex flex={1} direction="column" miw={0} h="100%">
        <AppHeader
          title={pageTitle}
          leftSection={
            isMobile && (
              <Burger
                opened={drawerOpened}
                onClick={handlers.open}
                size="sm"
                aria-label="Toggle navigation"
              />
            )
          }
        />

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
      <Drawer
        opened={drawerOpened}
        onClose={handlers.close}
        position="left"
        size={260}
        withCloseButton={false}
        padding={0}
        styles={{
          content: {
            backgroundColor: "var(--mantine-color-dark-7)",
          },
          body: {
            padding: 0,
          },
        }}
      >
        <AppSidebar onNavigate={handlers.close} />
      </Drawer>
    </Flex>
  );
}
