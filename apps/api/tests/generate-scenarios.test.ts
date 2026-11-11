import { describe, expect, it } from "vitest";
import { generateScenarios } from "../src/modules/runs/utils/generate-scenarios.js";

describe("generateScenarios", () => {
  const configuration = {
    targetUrl: "https://example.com",
    languages: ["en", "ms"],
    routes: ["/", "/about"],
    viewports: [
      { name: "Desktop", width: 1440, height: 900 },
      { name: "Mobile", width: 390, height: 844 },
    ],
  };

  it("should generate the correct number of scenarios", () => {
    const scenarios = generateScenarios(configuration);

    expect(scenarios).toHaveLength(8);
  });

  it("should initialize all scenarios with pending status", () => {
    const scenarios = generateScenarios(configuration);

    expect(scenarios.every((scenario) => scenario.status === "pending")).toBe(
      true,
    );
  });

  it("should generate the correct combinations", () => {
    const scenarios = generateScenarios(configuration);

    expect(scenarios).toContainEqual(
      expect.objectContaining({
        language: "en",
        route: "/",
        viewport: { name: "Desktop", width: 1440, height: 900 },
      }),
    );
  });

  it("should generate unique scenario IDs", () => {
    const scenarios = generateScenarios(configuration);

    const ids = scenarios.map((scenario) => scenario.id);

    expect(new Set(ids).size).toBe(8);
  });
});
