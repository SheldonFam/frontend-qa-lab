import type { Viewport } from "../schemas/test-configuration.schema.js";

export type TestScenario = {
  id: string;
  language: string;
  route: string;
  viewport: Viewport;
  status: "pending" | "passed" | "failed";
};

export type ScenarioResult = {
  scenarioId: string;
  status: "passed" | "failed";
  url: string;
  title: string | null;
  error: string | null;
};
