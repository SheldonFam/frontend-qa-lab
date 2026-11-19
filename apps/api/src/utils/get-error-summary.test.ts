import { describe, expect, it } from "vitest";

import { getErrorSummary } from "./get-error-summary.js";

describe("getErrorSummary", () => {
  it("should return the message of an error", () => {
    expect(getErrorSummary(new Error("Browser launch failed"))).toBe(
      "Browser launch failed",
    );
  });

  it("should keep only the first line", () => {
    const error = new Error(
      "page.goto: net::ERR_NAME_NOT_RESOLVED at https://does-not-exist.invalid/\nCall log:\n  - navigating to the page",
    );

    expect(getErrorSummary(error)).toBe(
      "page.goto: net::ERR_NAME_NOT_RESOLVED at https://does-not-exist.invalid/",
    );
  });

  it("should remove terminal colour codes", () => {
    const error = new Error("\u001b[2mnavigation\u001b[22m failed");

    expect(getErrorSummary(error)).toBe("navigation failed");
  });

  it("should limit the length to 300 characters", () => {
    const error = new Error("a".repeat(500));

    expect(getErrorSummary(error)).toHaveLength(300);
  });

  it("should handle values that are not errors", () => {
    expect(getErrorSummary("plain text")).toBe("plain text");
    expect(getErrorSummary(new Error(""))).toBe("Unknown error");
  });
});
