import type { Page } from "playwright";
import type { BrowserDiagnostics } from "../types/tool.types.js";

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
      diagnostics.consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    diagnostics.pageErrors.push(error.message);
  });

  page.on("requestfailed", (request) => {
    const failure = request.failure();

    diagnostics.failedRequests.push(
      `${request.method()} ${request.url()} - ${failure?.errorText ?? "Unknown error"}`,
    );
  });
}
