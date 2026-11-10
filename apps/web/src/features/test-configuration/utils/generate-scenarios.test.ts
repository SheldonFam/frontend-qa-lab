import { describe, expect, it } from "vitest";

import type { TestConfiguration } from "../types/test-configuration";
import { generateScenarios } from "./generate-scenarios";

describe("generateScenarios", () => {
  const configurations: TestConfiguration = {
    targetUrl: "https://example.com",
    languages: ["en", "bm"],
    routes: ["/", "/login"],
    viewports: [
      { name: "Desktop", width: 1440, height: 900 },
      { name: "Mobile", width: 300, height: 844 },
    ],
  };

  // Test 1: Scenario count
  it("should generate the correct number of scenarios", () => {
    const scenarios = generateScenarios(configurations);

    expect(scenarios).toHaveLength(8);
  });

  // Test 2: Initial status
  it("should initialize all scenarios with pending status", () => {
    const scenarios = generateScenarios(configurations);

    expect(scenarios.every((scenario) => scenario.status === "pending")).toBe(
      true,
    );
  });

  // Test 3: Expected combination exists
  it("should generate the correct language, route and viewport combinations", () => {
    const scenarios = generateScenarios(configurations);

    const scenario = scenarios.find((scenario) => {
      return (
        scenario.language === "en" &&
        scenario.route === "/" &&
        scenario.viewport.name === "Desktop"
      );
    });

    expect(scenario).toBeDefined();
  });

  // Test 4: No duplicate combinations
  it("should generate unique scenario combinations", () => {
    const scenarios = generateScenarios(configurations);

    const combinations = scenarios.map(
      (scenario) =>
        `${scenario.language}|${scenario.route}|${scenario.viewport.name}`,
    );

    const uniqueCombinations = new Set(combinations);

    expect(uniqueCombinations.size).toBe(scenarios.length);
  });
});
