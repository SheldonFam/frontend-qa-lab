import { describe, expect, it } from "vitest";

import { mockLLMClient } from "./mock-llm.client.js";
import { getPlannerClient } from "./planner-client.js";

describe("getPlannerClient", () => {
  it("should use the mock planner when PLANNER_CLIENT is mock", () => {
    expect(getPlannerClient()).toBe(mockLLMClient);
  });
});
