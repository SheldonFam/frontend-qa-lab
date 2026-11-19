import { beforeEach, describe, expect, it, vi } from "vitest";
import OpenAI from "openai";
import {
  createOpenAIAgentClient,
  type OpenAIResponsesClient,
} from "./openai-agent.client.js";

function createMockOpenAI(response: unknown): OpenAIResponsesClient {
  return {
    responses: {
      create: vi.fn().mockResolvedValue(response),
    },
  } as unknown as OpenAIResponsesClient;
}

describe("openAIAgentClient", () => {
  it("should return tool calls when OpenAI requests a tool", async () => {
    const response = {
      id: "response-1",
      status: "completed",
      output: [
        {
          type: "function_call",
          call_id: "call-1",
          name: "inspect_page",
          arguments: "{}",
        },
      ],
      output_text: "",
    };

    const mockOpenAI = createMockOpenAI(response);

    const client = createOpenAIAgentClient(mockOpenAI, "test-model");

    const result = await client.generateResponse({
      messages: [
        {
          role: "system",
          content: "You are a QA Agent.",
        },
        {
          role: "user",
          content: "Inspect the login page.",
        },
      ],
      tools: [
        {
          name: "inspect_page",
          description: "Inspect the current page.",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      ],
    });

    expect(result).toEqual({
      type: "tool_calls",
      toolCalls: [
        {
          id: "call-1",
          name: "inspect_page",
          arguments: {},
        },
      ],
    });
  });

  it("should return final answer when OpenAI finishes", async () => {
    const response = {
      id: "response-2",
      status: "completed",
      output: [],
      output_text: "The login page is working.",
    };

    const mockOpenAI = createMockOpenAI(response);

    const client = createOpenAIAgentClient(mockOpenAI, "test-model");

    const result = await client.generateResponse({
      messages: [
        {
          role: "user",
          content: "Inspect the login page.",
        },
      ],
      tools: [],
    });

    expect(result).toEqual({
      type: "final",
      message: "The login page is working.",
    });
  });

  it("should throw when OpenAI response is not completed", async () => {
    const response = {
      id: "response-3",
      status: "incomplete",
      output: [],
      output_text: "",
    };

    const mockOpenAI = createMockOpenAI(response);

    const client = createOpenAIAgentClient(mockOpenAI, "test-model");

    await expect(
      client.generateResponse({
        messages: [
          {
            role: "user",
            content: "Inspect the login page.",
          },
        ],
        tools: [],
      }),
    ).rejects.toThrow("OpenAI response did not complete. Status: incomplete");
  });
});

describe("openAIAgentClient errors", () => {
  function createFailingOpenAI(error: unknown): OpenAIResponsesClient {
    return {
      responses: {
        create: vi.fn().mockRejectedValue(error),
      },
    } as unknown as OpenAIResponsesClient;
  }

  function generateResponseWith(error: unknown) {
    const client = createOpenAIAgentClient(
      createFailingOpenAI(error),
      "test-model",
    );

    return client.generateResponse({
      messages: [
        {
          role: "user",
          content: "Inspect the login page.",
        },
      ],
      tools: [],
    });
  }

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should hide the provider message when the usage limit is reached", async () => {
    const providerError = new OpenAI.APIError(
      429,
      undefined,
      "Rate limit reached in organization org-secret",
      undefined,
    );

    await expect(generateResponseWith(providerError)).rejects.toThrow(
      "The AI service usage limit was reached. Try again later.",
    );
  });

  it("should explain when the API key is rejected", async () => {
    const providerError = new OpenAI.APIError(
      401,
      undefined,
      "Incorrect API key provided: sk-secret",
      undefined,
    );

    await expect(generateResponseWith(providerError)).rejects.toThrow(
      "The AI service rejected the API key.",
    );
  });

  it("should report other provider errors by status only", async () => {
    const providerError = new OpenAI.APIError(
      500,
      undefined,
      "Internal details",
      undefined,
    );

    await expect(generateResponseWith(providerError)).rejects.toThrow(
      "The AI service returned an error (500).",
    );
  });

  it("should report a connection problem", async () => {
    await expect(
      generateResponseWith(new Error("socket hang up")),
    ).rejects.toThrow("Could not reach the AI service.");
  });
});
