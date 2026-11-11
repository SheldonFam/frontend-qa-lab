import { Paper, Text } from "@mantine/core";

import { Page } from "../../../components/layout/page";

export function SettingsPage() {
  return (
    <Page title="Settings">
      <Paper withBorder radius="md" p="lg">
        <Text size="sm" c="dimmed">
          There are no settings to configure yet.
        </Text>
      </Paper>
    </Page>
  );
}
