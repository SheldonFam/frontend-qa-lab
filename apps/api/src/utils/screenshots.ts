import { mkdir } from "node:fs/promises";
import path from "node:path";
import type { Page } from "playwright";

export const SCREENSHOT_DIRECTORY = "screenshots";

export async function saveScreenshot(
  page: Page,
  runId: string,
  scenarioId: string,
): Promise<string> {
  const screenshotPath = path.join(
    SCREENSHOT_DIRECTORY,
    runId,
    `${scenarioId}.png`,
  );

  await mkdir(path.dirname(screenshotPath), {
    recursive: true,
  });

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  return screenshotPath;
}
