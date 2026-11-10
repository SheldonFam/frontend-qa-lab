import { useEffect } from "react";
import { Box, Drawer, Flex } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Outlet, useLocation } from "react-router";

import { AppSidebar } from "../../components/layout/app-sidebar";
import { AppHeader } from "../../components/layout/app-header";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/test-runs": "Test Runs",
  "/test-configuration": "New Test",
  "/settings": "Settings",
};

export function AppLayout() {
  const location = useLocation();

  const [opened, { open, close }] = useDisclosure(false);

  const isMobile = useMediaQuery("(max-width: 991px)");

  const pageTitle = pageTitles[location.pathname] || "Frontend QA Lab";

  // Close the Drawer when switching back to Desktop.
  useEffect(() => {
    if (!isMobile) {
      close();
    }
  }, [isMobile, close]);

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
          menuOpened={opened}
          onMenuClick={open}
          showMenuButton={isMobile}
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
      {isMobile && (
        <Drawer
          opened={opened}
          onClose={close}
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
          <AppSidebar onNavigate={close} />
        </Drawer>
      )}
    </Flex>
  );
}
