import type { LanguageCode } from "../constants/languages";
import type { Viewport } from "./viewport";

export type TestScenarioStatus =
  | "pending"
  | "running"
  | "passed"
  | "failed"
  | "skipped";

export interface TestScenario {
  id: string;
  language: LanguageCode;
  route: string;
  viewport: Viewport;
  status: TestScenarioStatus;
}
