import { describe, expect, it } from "vitest";
import { testPlanOutputSchema, testPlanSchema } from "./test-plan.schema.js";

describe("testPlanOutputSchema", () => {
  it("should accept a valid test plan", () => {
    const input = {
      name: "Login Test",
      description: "Verify login functionality",
      steps: [
        {
          action: "navigate",
          target: "/login",
        },
        {
          action: "fill",
          target: "email input",
          value: "test@example.com",
        },
      ],
    };

    const result = testPlanOutputSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should reject fill step without value", () => {
    const input = {
      name: "Login Test",
      description: "Verify login functionality",
      steps: [
        {
          action: "fill",
          target: "email input",
        },
      ],
    };

    const result = testPlanOutputSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject assert_text step without expectedResult", () => {
    const input = {
      name: "Content Test",
      description: "Verify page content",
      steps: [
        {
          action: "assert_text",
          target: "page heading",
        },
      ],
    };

    const result = testPlanOutputSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject unsupported action", () => {
    const input = {
      name: "Login Test",
      description: "Verify login functionality",
      steps: [
        {
          action: "submit",
          target: "login button",
        },
      ],
    };
    const result = testPlanOutputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("should reject unknown fields in a step", () => {
    const input = {
      name: "Login Test",
      description: "Verify login functionality",
      steps: [
        {
          action: "navigate",
          target: "/login",
          unexpected: true,
        },
      ],
    };

    const result = testPlanOutputSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject navigate step without target", () => {
    const input = {
      name: "Login Test",
      description: "Verify login functionality",
      steps: [
        {
          action: "navigate",
        },
      ],
    };

    const result = testPlanOutputSchema.safeParse(input);

    expect(result.success).toBe(false);
  });
});

describe("testPlanSchema", () => {
  it("should accept a valid final test plan", () => {
    const input = {
      id: "plan-001",
      name: "Login Test",
      description: "Verify login functionality",
      steps: [
        {
          id: "step-001",
          action: "navigate",
          target: "/login",
        },
        {
          id: "step-002",
          action: "fill",
          target: "email input",
          value: "test@example.com",
        },
      ],
    };

    const result = testPlanSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should reject final test plan without plan ID", () => {
    const input = {
      name: "Login Test",
      description: "Verify login functionality",
      steps: [
        {
          id: "step-001",
          action: "navigate",
          target: "/login",
        },
      ],
    };

    const result = testPlanSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject final test plan without step ID", () => {
    const input = {
      id: "plan-001",
      name: "Login Test",
      description: "Verify login functionality",
      steps: [
        {
          action: "navigate",
          target: "/login",
        },
      ],
    };

    const result = testPlanSchema.safeParse(input);

    expect(result.success).toBe(false);
  });
});
