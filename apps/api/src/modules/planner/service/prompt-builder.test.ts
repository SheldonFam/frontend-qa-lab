import { describe, expect, it } from "vitest";
import { buildPlannerPrompt } from "./prompt-builder.js";

describe("buildPlannerPrompt", () => {
  it("should include all user inputs in the prompt", () => {
    const input = {
      targetUrl: "https://example.com",
      languages: ["English", "Malay"],
      routes: ["/login", "/register"],
      viewports: [
        { name: "Desktop", width: 1920, height: 1080 },
        { name: "Mobile", width: 375, height: 812 },
      ],
      requirements: "Test login functionality",
    };

    const result = buildPlannerPrompt(input);

    // Target URL
    expect(result.userPrompt).toContain(
      Buffer.from(input.targetUrl).toString("base64"),
    );

    // Requirements
    expect(result.userPrompt).toContain(
      Buffer.from(input.requirements).toString("base64"),
    );

    // Languages
    for (const language of input.languages) {
      expect(result.userPrompt).toContain(
        Buffer.from(language).toString("base64"),
      );
    }

    // Routes
    for (const route of input.routes) {
      expect(result.userPrompt).toContain(
        Buffer.from(route).toString("base64"),
      );
    }

    // Viewports
    expect(result.userPrompt).toContain('"name": "Desktop"');
    expect(result.userPrompt).toContain('"width": 1920');
    expect(result.userPrompt).toContain('"height": 1080');

    expect(result.userPrompt).toContain('"name": "Mobile"');
    expect(result.userPrompt).toContain('"width": 375');
    expect(result.userPrompt).toContain('"height": 812');
  });

  it("should include planner role and rules in system prompt", () => {
    const input = {
      targetUrl: "https://example.com",
      languages: ["English"],
      routes: ["/login"],
      viewports: [{ name: "Desktop", width: 1920, height: 1080 }],
      requirements: "Test login functionality",
    };

    const result = buildPlannerPrompt(input);

    expect(result.systemPrompt).toContain(
      "expert QA Test Planner specializing in frontend applications",
    );

    expect(result.systemPrompt).toContain(
      "Do not invent website functionality",
    );

    expect(result.systemPrompt).toContain("Do not execute browser actions");
  });
});
