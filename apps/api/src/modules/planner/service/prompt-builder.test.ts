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

function getRequirementsInPrompt(requirements: string): string {
  const prompt = buildPlannerPrompt({
    targetUrl: "https://example.com",
    languages: ["en"],
    routes: ["/"],
    viewports: [{ name: "Desktop", width: 1920, height: 1080 }],
    requirements,
  });

  const match = prompt.userPrompt.match(/"requirements_b64": "([^"]*)"/);

  return Buffer.from(match?.[1] ?? "", "base64").toString("utf8");
}

describe("buildPlannerPrompt requirements", () => {
  it("should keep ordinary words such as user, function and system", () => {
    const requirements =
      "Check that the user can log in and the search function works on the system settings page.";

    expect(getRequirementsInPrompt(requirements)).toBe(requirements);
  });

  it("should keep requirements written in other languages", () => {
    const requirements = [
      "检查登录页面是否正常显示",
      "Semak borang hubungi kami – pastikan mesej ralat dipaparkan",
    ];

    for (const requirement of requirements) {
      expect(getRequirementsInPrompt(requirement)).toBe(requirement);
    }
  });

  it("should keep symbols such as prices, brackets and tags", () => {
    const requirements =
      "Verify the price shows $10, the [Buy] button works and <b>Sale</b> is bold.";

    expect(getRequirementsInPrompt(requirements)).toBe(requirements);
  });

  it("should turn line breaks and tabs into single spaces", () => {
    const requirements = "Check the header.\n\nCheck\tthe   footer.  ";

    expect(getRequirementsInPrompt(requirements)).toBe(
      "Check the header. Check the footer.",
    );
  });

  it("should limit requirements to 2000 characters", () => {
    const requirements = "a".repeat(2500);

    expect(getRequirementsInPrompt(requirements)).toHaveLength(2000);
  });
});
