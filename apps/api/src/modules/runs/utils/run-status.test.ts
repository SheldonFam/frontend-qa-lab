import { describe, expect, it } from "vitest";

import { isRunFinished } from "./run-status.js";

describe("isRunFinished", () => {
  it("should say that a run still in progress is not finished", () => {
    expect(isRunFinished("queued")).toBe(false);
    expect(isRunFinished("planning")).toBe(false);
    expect(isRunFinished("running")).toBe(false);
  });

  it("should say that a run that ended is finished", () => {
    expect(isRunFinished("completed")).toBe(true);
    expect(isRunFinished("failed")).toBe(true);
    expect(isRunFinished("cancelled")).toBe(true);
  });
});
