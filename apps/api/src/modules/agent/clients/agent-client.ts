// 1. Messages sent to the LLM
export type AgentMessage =
  | {
      role: "system";
      content: string;
    }
  | {
      role: "user";
      content: string;
    }
  | {
      role: "assistant";
      content: string;
      toolCalls?: AgentToolCall[];
    }
  | {
      role: "tool";
      toolCallId: string;
      content: string;
    };

// 2. Tool information provided to the LLM
export type AgentToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

// 3. Tool call returned by the LLM
export type AgentToolCall = {
  id: string;
  name: string;
  arguments: unknown;
};

// 4. Agent response
export type AgentClientResponse =
  | {
      type: "tool_calls";
      toolCalls: AgentToolCall[];
    }
  | {
      type: "final";
      message: string;
    };

// 5. Agent request
export type AgentClientInput = {
  messages: AgentMessage[];
  tools: AgentToolDefinition[];
};

// 6. Agent Client interface
export type AgentClient = {
  generateResponse: (input: AgentClientInput) => Promise<AgentClientResponse>;
};
