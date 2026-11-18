import { NavLink, Stack, Text } from "@mantine/core";
import { NavLink as RouterNavLink } from "react-router";
import { APP_NAME } from "../../constants/app";
import classes from "./app-sidebar.module.css";
import { navigationItems } from "./navigation-items";

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  return (
    <Stack h="100%" p="md" gap="md">
      <Text fw={700} size="lg" pb="md" className={classes.brand}>
        {APP_NAME}
      </Text>

      <Stack gap={4}>
        {navigationItems.map((item) => (
          <NavLink
            key={item.href}
            label={item.label}
            leftSection={<item.icon size={20} strokeWidth={1.8} />}
            onClick={onNavigate}
            classNames={{ root: classes.root, label: classes.label }}
            // Render React Router's NavLink. It adds aria-current="page" to
            // the current page's link, and Mantine highlights that link, so
            // we don't need to work out which link is active ourselves.
            renderRoot={(props) => <RouterNavLink to={item.href} {...props} />}
          />
        ))}
      </Stack>
    </Stack>
  );
}
