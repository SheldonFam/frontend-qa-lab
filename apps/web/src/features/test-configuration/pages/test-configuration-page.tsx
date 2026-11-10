import {
  Button,
  Checkbox,
  Container,
  MultiSelect,
  Paper,
  Stack,
  TagsInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Viewport } from "../types/viewport";
import { useState } from "react";
import type { TestScenario } from "../types/test-scenario";
import type { TestConfiguration } from "../types/test-configuration";
import { generateScenarios } from "../utils/generate-scenarios";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "bm", label: "Bahasa Melayu" },
  { value: "zh", label: "Chinese" },
];

const VIEWPORT_PRESETS: Viewport[] = [
  { name: "Desktop", width: 1440, height: 900 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Mobile", width: 390, height: 844 },
];

interface TestConfigurationFormValues {
  targetUrl: string;
  languages: string[];
  routes: string[];
  selectedViewportNames: string[];
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function TestConfigurationPage() {
  const form = useForm<TestConfigurationFormValues>({
    mode: "controlled",
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

      routes: (value) =>
        !value.some((route) => route.trim().length > 0)
          ? "Enter at least one route"
          : null,

      selectedViewportNames: (value) =>
        value.length === 0 ? "Select at least one viewport" : null,
    },
  });

  const [scenarios, setScenarios] = useState<TestScenario[]>([]);

  function handleSubmit(values: TestConfigurationFormValues) {
    const selectedViewports = VIEWPORT_PRESETS.filter((viewport) =>
      values.selectedViewportNames.includes(viewport.name),
    );
    const configuration: TestConfiguration = {
      targetUrl: values.targetUrl.trim(),
      languages: values.languages,
      routes: values.routes,
      viewports: selectedViewports,
    };

    const generatedScenarios = generateScenarios(configuration);

    setScenarios(generatedScenarios);
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Page Header */}
        <Stack gap={4}>
          <Title order={2}>New Test Run</Title>

          <Text size="sm" c="dimmed">
            Configure your frontend testing scenarios.
          </Text>
        </Stack>

        {/* Configuration Form */}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Paper withBorder radius="md" p="lg">
            <Stack gap="lg">
              <Stack gap={4}>
                <Title order={4}>Test Configuration</Title>

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

              <Button type="submit">Generate Scenarios</Button>
            </Stack>
          </Paper>
        </form>

        {/* Scenario Preview */}
        <Paper withBorder radius="md" p="lg">
          <Stack gap="md">
            <Title order={4}>Scenario Preview</Title>

            <Text size="sm" c="dimmed">
              Generate {scenarios.length} scenarios.
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
