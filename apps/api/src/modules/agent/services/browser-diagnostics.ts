import type { Page } from "playwright";
import type { BrowserDiagnostics } from "../types/tool.types.js";

import { addSavedItem, shortenText } from "../../../utils/saved-items.js";

export function createBrowserDiagnostics(): BrowserDiagnostics {
  return {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
  };
}

export function attachBrowserDiagnostics(
  page: Page,
  diagnostics: BrowserDiagnostics,
): void {
  page.on("console", (message) => {
    if (message.type() === "error") {
      addSavedItem(diagnostics.consoleErrors, shortenText(message.text()));
    }
  });

  page.on("pageerror", (error) => {
    addSavedItem(diagnostics.pageErrors, shortenText(error.message));
  });

  page.on("requestfailed", (request) => {
    const failure = request.failure();

    addSavedItem(
      diagnostics.failedRequests,
      `${request.method()} ${shortenText(request.url())} - ${failure?.errorText ?? "Unknown error"}`,
    );
  });
}
