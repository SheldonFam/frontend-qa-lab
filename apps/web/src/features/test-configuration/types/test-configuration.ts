import type { Viewport } from "./viewport";

export interface TestConfiguration {
  targetUrl: string;
  languages: string[];
  routes: string[];
  viewports: Viewport[];
}
