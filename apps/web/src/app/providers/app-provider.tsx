import {
  createTheme,
  MantineProvider,
  type CSSVariablesResolver,
} from "@mantine/core";

import "@mantine/core/styles.css";

interface AppProvidersProps {
  children: React.ReactNode;
}

const theme = createTheme({
  // Use shade 8 for buttons and colored text (like c="green"). Mantine's
  // default, shade 6, is too light to read easily, e.g. white text on a blue
  // button.
  primaryShade: 8,
});

// Colors for light mode and dark mode, kept in one place. Mantine uses the
// `light` values in light mode and the `dark` values in dark mode.
// Docs: https://mantine.dev/styles/css-variables/
const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    // Gray text, placeholder text and error text. Mantine's defaults are too
    // faint to read easily, so these are darker (they pass the WCAG contrast
    // check).
    "--mantine-color-dimmed": "#687079",
    "--mantine-color-placeholder": "#687079",
    "--mantine-color-error": "var(--mantine-color-red-9)",
    // Page background and border color, used by the layout
    "--app-page-bg": "var(--mantine-color-gray-0)",
    "--app-border": "var(--mantine-color-gray-3)",
  },
  dark: {
    // The same colors as above, for dark mode
    "--mantine-color-dimmed": "#969696",
    "--mantine-color-placeholder": "#969696",
    "--mantine-color-error": "var(--mantine-color-red-5)",
    "--app-page-bg": "var(--mantine-color-dark-8)",
    "--app-border": "var(--mantine-color-dark-4)",
  },
});

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver}>
      {children}
    </MantineProvider>
  );
}
