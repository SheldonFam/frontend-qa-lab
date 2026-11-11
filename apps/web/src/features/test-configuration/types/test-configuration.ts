import type { LanguageCode } from "../constants/languages";
import type { Viewport } from "./viewport";

export interface TestConfiguration {
  targetUrl: string;
  languages: LanguageCode[];
  routes: string[];
  viewports: Viewport[];
}
