import { describe, expect, it } from "vitest";

import { getStepDetails } from "./get-step-details";

describe("getStepDetails", () => {
  it("should turn each argument into one readable line", () => {
    const details = getStepDetails({
      role: "heading",
      expectedText: "Welcome",
    });

    expect(details).toEqual(["Role: heading", "Expected text: Welcome"]);
  });

  it("should return no lines when the tool has no arguments", () => {
    expect(getStepDetails({})).toEqual([]);
  });

  it("should return no lines when the arguments are not an object", () => {
    expect(getStepDetails(null)).toEqual([]);
    expect(getStepDetails("button")).toEqual([]);
    expect(getStepDetails(["button"])).toEqual([]);
  });
});
