import { describe, expect, it } from "vitest";
import { testConfigurationSchema } from "../src/modules/runs/schemas/test-configuration.schema.js";

describe("testConfigurationSchema", () => {
  it("should accept a valid configuration", () => {
    const result = testConfigurationSchema.safeParse({
      targetUrl: "https://example.com",
      languages: ["en", "ms"],
      routes: ["/", "/about"],
      viewports: [
        {
          name: "Desktop",
          width: 1440,
          height: 900,
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});

it("should reject an invalid URL", () => {
  const result = testConfigurationSchema.safeParse({
    targetUrl: "not-a-url",
    languages: ["en"],
    routes: ["/"],
    viewports: [
      {
        name: "Desktop",
        width: 1440,
        height: 900,
      },
    ],
  });

  expect(result.success).toBe(false);
});

it("should reject empty languages", () => {
  const result = testConfigurationSchema.safeParse({
    targetUrl: "https://example.com",
    languages: [],
    routes: ["/"],
    viewports: [
      {
        name: "Desktop",
        width: 1440,
        height: 900,
      },
    ],
  });

  expect(result.success).toBe(false);
});

it("should reject negative viewport width", () => {
  const result = testConfigurationSchema.safeParse({
    targetUrl: "https://example.com",
    languages: ["en"],
    routes: ["/"],
    viewports: [
      {
        name: "Desktop",
        width: -1440,
        height: 900,
      },
    ],
  });

  expect(result.success).toBe(false);
});
