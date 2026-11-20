import type { FailureAnalysis } from "../../analysis/failure-analysis.schema.js";
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
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];

  buttons: {
    text: string;
    disabled: boolean;
  }[];

  inputs: {
    type: string;
    name: string | null;
    placeholder: string | null;
    disabled: boolean;
  }[];

  error: string | null;
  assertions: AssertionResult[];
  agentSteps: AgentStep[];
  agentSummary: string | null;
  failureAnalysis: FailureAnalysis | null;
  screenshotPath: string | null;
};

export type AssertionResult = {
  name: string;
  passed: boolean;
  message: string;
};

export type AgentStep = {
  tool: string;
  arguments: unknown;
  success: boolean;
  passed: boolean | null;
  error: string | null;
};
