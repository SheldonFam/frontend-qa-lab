import {
  FlaskConical,
  LayoutDashboard,
  ListChecks,
  Settings,
  type LucideIcon,
} from "lucide-react";

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// The sidebar shows these items in this order.
export const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "New Test", href: "/test-configuration", icon: FlaskConical },
  { label: "Test Runs", href: "/test-runs", icon: ListChecks },
  { label: "Settings", href: "/settings", icon: Settings },
];
