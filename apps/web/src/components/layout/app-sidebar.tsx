import { NavLink, Stack, Text } from "@mantine/core";
import { Link, useLocation } from "react-router";
import classes from "./app-sidebar.module.css";
import { navigationItems } from "./navigation-items";

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const location = useLocation();

  return (
    <aside style={{ width: "100%", height: "100%" }}>
      <Stack h="100%" p="md" gap="lg">
        <Text fw={700} size="lg" c="white">
          Frontend QA Lab
        </Text>

        <Stack gap="xs">
          {navigationItems.map((item) => (
            <NavLink
              key={item.href}
              component={Link}
              to={item.href}
              label={item.label}
              onClick={onNavigate}
              classNames={{
                root: classes.root,
                label: classes.label,
              }}
              active={location.pathname === item.href}
            />
          ))}
        </Stack>
      </Stack>
    </aside>
  );
}
