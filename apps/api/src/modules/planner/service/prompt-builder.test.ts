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

    expect(result.userPrompt).toContain(input.targetUrl);
    expect(result.userPrompt).toContain(input.requirements);

    // Languages
    expect(result.userPrompt).toContain("English");
    expect(result.userPrompt).toContain("Malay");

    // Routes
    expect(result.userPrompt).toContain("/login");
    expect(result.userPrompt).toContain("/register");

    // Viewports
    expect(result.userPrompt).toContain("Desktop (1920x1080)");
    expect(result.userPrompt).toContain("Mobile (375x812)");

    // System Prompt
    expect(result.systemPrompt).toContain("Do not execute browser actions");

    expect(result.userPrompt).toContain("English");
    expect(result.userPrompt).toContain("Malay");

    expect(result.userPrompt).toContain("/login");
    expect(result.userPrompt).toContain("/register");

    expect(result.userPrompt).toContain("Desktop (1920x1080)");
    expect(result.userPrompt).toContain("Mobile (375x812)");
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

    expect(result.systemPrompt).toContain("expert Frontend QA Engineer");
    expect(result.systemPrompt).toContain(
      "Do not invent website functionality",
    );
    expect(result.systemPrompt).toContain("Do not execute browser actions");
  });
});
