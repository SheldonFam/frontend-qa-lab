import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
  type ViewportSize,
} from "playwright";

// 1. Launch Browser
export function launchBrowser(): Promise<Browser> {
  return chromium.launch({
    headless: true,
  });
}

// 2. Create BrowserContext
export function createBrowserContext(
  browser: Browser,
  viewport: ViewportSize,
): Promise<BrowserContext> {
  return browser.newContext({
    viewport,
  });
}

// 3. Create Page
export function createPage(context: BrowserContext): Promise<Page> {
  return context.newPage();
}
