import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";

import type { TestConfiguration } from "../src/modules/runs/schemas/test-configuration.schema.js";
import type { TestScenario } from "../src/modules/runs/types/scenario.types.js";

import { launchBrowser } from "../src/browser/browser-manager.js";
import { runScenario } from "../src/modules/runs/services/scenario-runner.js";

async function main() {
  const html = await readFile(
    new URL("./fixtures/javascript-errors.html", import.meta.url),
    "utf-8",
  );

  const server = createServer((request, response) => {
    if (request.url === "/api/fail") {
      response.destroy();
      return;
    }

    response.writeHead(200, {
      "Content-Type": "text/html",
    });

    response.end(html);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address() as AddressInfo;
  const targetUrl = `http://127.0.0.1:${address.port}`;

  const configuration: TestConfiguration = {
    targetUrl,
    languages: ["en"],
    routes: ["/javascript-errors.html"],
    viewports: [
      {
        name: "desktop",
        width: 1280,
        height: 720,
      },
    ],
  };

  const scenario: TestScenario = {
    id: "manual-001",
    language: "en",
    route: "/javascript-errors.html",
    viewport: configuration.viewports[0]!,
    status: "pending",
  };

  // Unique ID for this manual test run
  const runId = "manual-screenshot-test";

  const browser = await launchBrowser();

  try {
    const result = await runScenario(browser, configuration, scenario, runId);

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
