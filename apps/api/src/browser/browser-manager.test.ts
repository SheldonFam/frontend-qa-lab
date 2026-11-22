import { describe, expect, it, vi } from "vitest";
import type { Browser } from "playwright";

import { createBrowserContext } from "./browser-manager.js";

describe("createBrowserContext", () => {
  it("should start the browser context with the viewport and the language", async () => {
    const newContext = vi.fn().mockResolvedValue({});
    const browser = { newContext } as unknown as Browser;

    await createBrowserContext(browser, { width: 390, height: 844 }, "ms");

    expect(newContext).toHaveBeenCalledWith({
      viewport: {
        width: 390,
        height: 844,
      },
      locale: "ms",
    });
  });
});
