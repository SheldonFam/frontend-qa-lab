import { describe, expect, it } from "vitest";

import { fillRouteLanguage } from "./fill-route-language.js";

describe("fillRouteLanguage", () => {
  it("should put the language into the path", () => {
    expect(fillRouteLanguage("/{language}/login", "ms")).toBe("/ms/login");
  });

  it("should put the language into the query string", () => {
    expect(fillRouteLanguage("/login?lang={language}", "en")).toBe(
      "/login?lang=en",
    );
  });

  it("should fill every marker in the route", () => {
    expect(fillRouteLanguage("/{language}/docs?lang={language}", "zh")).toBe(
      "/zh/docs?lang=zh",
    );
  });

  it("should leave a route without a marker unchanged", () => {
    expect(fillRouteLanguage("/login", "ms")).toBe("/login");
  });
});
