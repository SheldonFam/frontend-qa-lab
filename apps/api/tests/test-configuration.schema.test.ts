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

function createConfiguration(overrides: Record<string, unknown>) {
  return {
    targetUrl: "https://example.com",
    languages: ["en"],
    routes: ["/"],
    viewports: [
      {
        name: "Desktop",
        width: 1440,
        height: 900,
      },
    ],
    ...overrides,
  };
}

describe("testConfigurationSchema safety rules", () => {
  it("should accept http and https URLs, including localhost", () => {
    const targetUrls = [
      "https://example.com",
      "http://example.com",
      "http://localhost:5173",
    ];

    for (const targetUrl of targetUrls) {
      const result = testConfigurationSchema.safeParse(
        createConfiguration({ targetUrl }),
      );

      expect(result.success).toBe(true);
    }
  });

  it("should reject URLs that are not http or https", () => {
    const targetUrls = [
      "ftp://example.com",
      "file:///etc/passwd",
      "javascript:alert(1)",
    ];

    for (const targetUrl of targetUrls) {
      const result = testConfigurationSchema.safeParse(
        createConfiguration({ targetUrl }),
      );

      expect(result.success).toBe(false);
    }
  });

  it("should accept routes with a query string or a hash", () => {
    const result = testConfigurationSchema.safeParse(
      createConfiguration({ routes: ["/search?q=shoes", "/docs#install"] }),
    );

    expect(result.success).toBe(true);
  });

  it("should reject a route that does not start with a slash", () => {
    const routes = ["login", "", "https://other-site.test/x"];

    for (const route of routes) {
      const result = testConfigurationSchema.safeParse(
        createConfiguration({ routes: [route] }),
      );

      expect(result.success).toBe(false);
    }
  });

  it("should reject a route that leaves the target website", () => {
    const routes = ["//other-site.test/x", "/\\other-site.test/x"];

    for (const route of routes) {
      const result = testConfigurationSchema.safeParse(
        createConfiguration({ routes: [route] }),
      );

      expect(result.success).toBe(false);
    }
  });

  it("should accept routes with a language marker", () => {
    const result = testConfigurationSchema.safeParse(
      createConfiguration({
        languages: ["en", "ms"],
        routes: ["/{language}/login", "/login?lang={language}"],
      }),
    );

    expect(result.success).toBe(true);
  });

  it("should reject a route that leaves the target website after the language is filled in", () => {
    const languages = ["", "/other-site.test", "\\other-site.test"];

    for (const language of languages) {
      const result = testConfigurationSchema.safeParse(
        createConfiguration({
          languages: ["en", language],
          routes: ["/{language}/login"],
        }),
      );

      expect(result.success).toBe(false);
    }
  });
});
