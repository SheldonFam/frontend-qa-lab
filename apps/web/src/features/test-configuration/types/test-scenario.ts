import type { ApiScenarioStatus } from "../../../types/api";
import type { LanguageCode } from "../constants/languages";
import type { Viewport } from "./viewport";

export type TestScenarioStatus = ApiScenarioStatus;

export interface TestScenario {
  id: string;
  language: LanguageCode;
  route: string;
  viewport: Viewport;
  status: TestScenarioStatus;
}
