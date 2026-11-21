import { describe, expect, it } from "vitest";

import {
  MAX_SAVED_ITEMS,
  MAX_SAVED_TEXT_LENGTH,
} from "../../../utils/saved-items.js";

import { getPageDetails } from "./get-page-details.js";

describe("getPageDetails", () => {
  it("should return empty details when the inspection failed", () => {
    const details = getPageDetails({
      success: false,
      data: null,
      error: {
        code: "INSPECTION_FAILED",
        message: "Inspection failed",
      },
    });

    expect(details).toEqual({
      url: null,
      title: null,
      buttons: [],
      inputs: [],
    });
  });

  it("should read the page details from the inspection", () => {
    const details = getPageDetails({
      success: true,
      data: {
        url: "https://example.com/login",
        title: "Login",
        buttons: [
          {
            text: "Sign in",
            disabled: false,
          },
        ],
        formElements: [
          {
            tagName: "input",
            type: "email",
            name: "email",
            placeholder: "Email address",
            disabled: false,
          },
        ],
      },
      error: null,
    });

    expect(details).toEqual({
      url: "https://example.com/login",
      title: "Login",
      buttons: [
        {
          text: "Sign in",
          disabled: false,
        },
      ],
      inputs: [
        {
          type: "email",
          name: "email",
          placeholder: "Email address",
          disabled: false,
        },
      ],
    });
  });

  it("should keep only the first buttons and inputs up to the limit", () => {
    const buttons = Array.from(
      { length: MAX_SAVED_ITEMS + 30 },
      (_value, index) => ({
        text: `Button ${index + 1}`,
        disabled: false,
      }),
    );

    const formElements = Array.from(
      { length: MAX_SAVED_ITEMS + 30 },
      (_value, index) => ({
        tagName: "input",
        type: "text",
        name: `field-${index + 1}`,
        placeholder: null,
        disabled: false,
      }),
    );

    const details = getPageDetails({
      success: true,
      data: {
        buttons,
        formElements,
      },
      error: null,
    });

    expect(details.buttons).toHaveLength(MAX_SAVED_ITEMS);
    expect(details.buttons[MAX_SAVED_ITEMS - 1]?.text).toBe(
      `Button ${MAX_SAVED_ITEMS}`,
    );
    expect(details.inputs).toHaveLength(MAX_SAVED_ITEMS);
    expect(details.inputs[MAX_SAVED_ITEMS - 1]?.name).toBe(
      `field-${MAX_SAVED_ITEMS}`,
    );
  });

  it("should cut long texts from the page at the text limit", () => {
    const longText = "x".repeat(MAX_SAVED_TEXT_LENGTH + 100);
    const shortenedText = "x".repeat(MAX_SAVED_TEXT_LENGTH);

    const details = getPageDetails({
      success: true,
      data: {
        title: longText,
        buttons: [
          {
            text: longText,
            disabled: false,
          },
        ],
        formElements: [
          {
            tagName: "input",
            type: "text",
            name: longText,
            placeholder: longText,
            disabled: false,
          },
        ],
      },
      error: null,
    });

    expect(details.title).toBe(shortenedText);
    expect(details.buttons[0]?.text).toBe(shortenedText);
    expect(details.inputs[0]?.name).toBe(shortenedText);
    expect(details.inputs[0]?.placeholder).toBe(shortenedText);
  });
});
