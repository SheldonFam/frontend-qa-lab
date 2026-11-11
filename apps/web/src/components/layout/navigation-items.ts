interface NavigationItem {
  label: string;
  href: string;
}

// Sidebar order. Each label is also used as the page title in the header.
export const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "New Test", href: "/test-configuration" },
  { label: "Test Runs", href: "/test-runs" },
  { label: "Settings", href: "/settings" },
];
