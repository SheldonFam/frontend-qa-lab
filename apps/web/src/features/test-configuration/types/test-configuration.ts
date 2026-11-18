import type { ApiTestConfiguration } from "../../../types/api";
import type { LanguageCode } from "../constants/languages";

export interface TestConfiguration extends ApiTestConfiguration {
  languages: LanguageCode[];
}
