import { chromium } from "playwright";

import type { AgentClient } from "../src/modules/agent/clients/agent-client.js";
import { createAgentRuntime } from "../src/modules/agent/runtime/agent-runtime.js";

const TARGET_URL = "https://example.com";

const mockAgentClient: AgentClient = {
  async generateResponse({ messages }) {
    const toolResults = messages.filter((message) => message.role === "tool");

    // First turn: inspect the webpage
    if (toolResults.length === 0) {
      return {
        type: "tool_calls",
        toolCalls: [
          {
            id: "call_inspect_page_1",
            name: "inspect_page",
            arguments: {},
          },
        ],
      };
    }

    // Second turn: inspect the returned page information
    if (toolResults.length === 1) {
      const result = JSON.parse(toolResults[0].content);

      const hasLearnMoreLink =
        result.success === true &&
        result.data.links.some(
          (link: { text: string }) => link.text === "Learn more",
        );

      if (hasLearnMoreLink) {
        return {
          type: "tool_calls",
          toolCalls: [
            {
              id: "call_assert_visible_1",
              name: "assert_visible",
              arguments: {
                role: "link",
                name: "Learn more",
              },
            },
          ],
        };
      }

      return {
        type: "final",
        message: "The Learn more link was not found.",
      };
    }

    // Third turn: receive assertion result and finish
    if (toolResults.length === 2) {
      return {
        type: "final",
        message: "The Learn more link is visible.",
      };
    }

    return {
      type: "final",
      message: "Unexpected tool execution count.",
    };
  },
};

async function main() {
  const browser = await chromium.launch({
    headless: true,
  });

  let runtime: Awaited<ReturnType<typeof createAgentRuntime>> | undefined;

  try {
    runtime = await createAgentRuntime(browser, {
      runId: "browser-agent-test",
      scenarioId: "example-com",
      viewport: {
        width: 1280,
        height: 720,
      },
      allowedTools: ["inspect_page", "assert_visible"],
    });

    await runtime.page.goto(TARGET_URL);

    const result = await runtime.runAgent({
      client: mockAgentClient,
      messages: [
        {
          role: "system",
          content: "Inspect the webpage using available tools.",
        },
        {
          role: "user",
          content: `Inspect this webpage: ${TARGET_URL}`,
        },
      ],
      maxSteps: 3,
    });

    console.log("\nAgent status:", result.status);
    console.log("Agent message:", result.message);
    console.log("Tool steps:", result.steps);

    console.log(
      "Tool results:",
      result.messages.filter((message) => message.role === "tool"),
    );

    console.log("Page URL:", runtime.page.url());
    console.log("Page title:", await runtime.page.title());
  } finally {
    if (runtime) {
      await runtime.close();
    }

    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error("Browser Agent Test Failed:", error);
  process.exitCode = 1;
});
