import {
  createBrowserContext,
  createPage,
  launchBrowser,
} from "./browser-manager.js";

async function main() {
  const browser = await launchBrowser();

  try {
    const context = await createBrowserContext(browser, {
      width: 1280,
      height: 720,
    });
    const page = await createPage(context);
    console.log(await page.viewportSize());

    await page.goto("https://example.com");

    const title = await page.title();
    console.log(title);
  } finally {
    await browser.close();
  }
}

main();
