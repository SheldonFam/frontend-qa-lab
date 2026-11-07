import { MantineProvider } from "@mantine/core";

import "@mantine/core/styles.css";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return <MantineProvider>{children}</MantineProvider>;
}
