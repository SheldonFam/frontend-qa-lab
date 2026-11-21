import { describe, expect, it } from "vitest";

import {
  addSavedItem,
  MAX_SAVED_ITEMS,
  MAX_SAVED_TEXT_LENGTH,
  shortenText,
} from "./saved-items.js";

describe("shortenText", () => {
  it("should keep a short text as it is", () => {
    expect(shortenText("Login failed")).toBe("Login failed");
  });

  it("should cut a long text at the limit", () => {
    const longText = "x".repeat(MAX_SAVED_TEXT_LENGTH + 100);

    expect(shortenText(longText)).toBe("x".repeat(MAX_SAVED_TEXT_LENGTH));
  });
});

describe("addSavedItem", () => {
  it("should add an item to the list", () => {
    const items: string[] = [];

    addSavedItem(items, "First error");

    expect(items).toEqual(["First error"]);
  });

  it("should stop at the limit and add one note that more items were not saved", () => {
    const items: string[] = [];

    for (let index = 0; index < MAX_SAVED_ITEMS + 20; index += 1) {
      addSavedItem(items, `Error ${index + 1}`);
    }

    expect(items).toHaveLength(MAX_SAVED_ITEMS + 1);
    expect(items[MAX_SAVED_ITEMS - 1]).toBe(`Error ${MAX_SAVED_ITEMS}`);
    expect(items[MAX_SAVED_ITEMS]).toBe(
      `More items were not saved (limit of ${MAX_SAVED_ITEMS} reached).`,
    );
  });
});
