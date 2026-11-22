import { describe, expect, it } from "vitest";

import { createNameMatcher } from "./create-name-matcher.js";

describe("createNameMatcher", () => {
  it("should match the same name with different capital letters", () => {
    const matcher = createNameMatcher("PERSONAL & BUSINESS");

    expect(matcher.test("Personal & Business")).toBe(true);
    expect(matcher.test("personal & business")).toBe(true);
  });

  it("should not match a name that only contains the text", () => {
    const matcher = createNameMatcher("Login");

    expect(matcher.test("Login help")).toBe(false);
    expect(matcher.test("Quick Login")).toBe(false);
    expect(matcher.test("Login")).toBe(true);
  });

  it("should treat special characters as normal text", () => {
    expect(createNameMatcher("Price (RM)").test("Price (RM)")).toBe(true);
    expect(createNameMatcher("What is new?").test("What is new?")).toBe(true);
    expect(createNameMatcher("A+B").test("A+B")).toBe(true);
    expect(createNameMatcher("A+B").test("AAB")).toBe(false);
    expect(createNameMatcher("a.c").test("abc")).toBe(false);
    expect(createNameMatcher("[Close]").test("[Close]")).toBe(true);
    expect(createNameMatcher("C:\\temp").test("C:\\temp")).toBe(true);
    expect(
      createNameMatcher("50% | off ^ $1 {x}").test("50% | off ^ $1 {x}"),
    ).toBe(true);
  });

  it("should ignore extra spaces and line breaks in the name", () => {
    const matcher = createNameMatcher("  Log   masuk \n / Daftar ");

    expect(matcher.test("Log masuk / Daftar")).toBe(true);
  });
});
