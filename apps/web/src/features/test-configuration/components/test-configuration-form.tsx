import {
  Button,
  Checkbox,
  Group,
  MultiSelect,
  Paper,
  Stack,
  TagsInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";

import { LANGUAGE_OPTIONS, type LanguageCode } from "../constants/languages";
import { VIEWPORT_PRESETS } from "../constants/viewports";
import type { TestConfiguration } from "../types/test-configuration";
import { cleanRoutes } from "../utils/clean-routes";

interface TestConfigurationFormValues {
  targetUrl: string;
  languages: LanguageCode[];
  routes: string[];
  selectedViewportNames: string[];
}

interface TestConfigurationFormProps {
  onSubmit: (configuration: TestConfiguration) => void;
  onChange: () => void;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function TestConfigurationForm({
  onSubmit,
  onChange,
}: TestConfigurationFormProps) {
  const form = useForm<TestConfigurationFormValues>({
    mode: "controlled",
    validateInputOnBlur: true,
    onValuesChange: onChange,
    initialValues: {
      targetUrl: "",
      languages: [],
      routes: [],
      selectedViewportNames: [],
    },

    validate: {
      targetUrl: (value) => {
        if (!value.trim()) {
          return "Target URL is required";
        }

        if (!isValidHttpUrl(value.trim())) {
          return "Please enter a valid HTTP or HTTPS URL";
        }

        return null;
      },

      languages: (value) =>
        value.length === 0 ? "Select at least one language" : null,

      routes: (value) => {
        const routes = cleanRoutes(value);

        if (routes.length === 0) {
          return "Enter at least one route";
        }

        if (routes.some((route) => !route.startsWith("/"))) {
          return 'Routes must start with "/", for example /login';
        }

        return null;
      },

      selectedViewportNames: (value) =>
        value.length === 0 ? "Select at least one viewport" : null,
    },
  });

  function handleSubmit(values: TestConfigurationFormValues) {
    const selectedViewports = VIEWPORT_PRESETS.filter((viewport) =>
      values.selectedViewportNames.includes(viewport.name),
    );

    onSubmit({
      targetUrl: values.targetUrl.trim(),
      languages: values.languages,
      routes: cleanRoutes(values.routes),
      viewports: selectedViewports,
    });
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Paper withBorder radius="md" p="lg">
        <Stack gap="lg">
          <Stack gap={4}>
            <Title order={2} size="h4">
              Test Configuration
            </Title>

            <Text size="sm" c="dimmed">
              Configure the target URL, languages, routes and viewports.
            </Text>
          </Stack>

          {/* Target URL */}
          <TextInput
            label="Target URL"
            withAsterisk
            placeholder="https://example.com"
            {...form.getInputProps("targetUrl")}
          />

          {/* Languages */}
          <MultiSelect
            label="Languages"
            withAsterisk
            placeholder="Select languages"
            data={LANGUAGE_OPTIONS}
            {...form.getInputProps("languages")}
          />

          {/* Routes */}
          <TagsInput
            label="Routes"
            withAsterisk
            placeholder="Enter a route and press Enter"
            {...form.getInputProps("routes")}
          />

          {/* Viewports */}
          <Checkbox.Group
            label="Viewports"
            withAsterisk
            {...form.getInputProps("selectedViewportNames")}
          >
            <Stack gap="sm">
              {VIEWPORT_PRESETS.map((viewport) => (
                <Checkbox
                  key={viewport.name}
                  value={viewport.name}
                  label={`${viewport.name} (${viewport.width} × ${viewport.height})`}
                />
              ))}
            </Stack>
          </Checkbox.Group>

          <Group justify="flex-end">
            <Button type="submit" w={{ base: "100%", sm: "auto" }}>
              Generate Scenarios
            </Button>
          </Group>
        </Stack>
      </Paper>
    </form>
  );
}
