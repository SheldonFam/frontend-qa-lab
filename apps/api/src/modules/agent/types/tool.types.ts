import type { Page } from "playwright";
import type { z } from "zod";

export type ToolContext = {
  page: Page;
  runId?: string;
  scenarioId?: string;
  diagnostics?: BrowserDiagnostics;
};

export type ToolResult<TData> =
  | {
      success: true;
      data: TData;
      error: null;
    }
  | {
      success: false;
      data: null;
      error: {
        code: string;
        message: string;
      };
    };

export type RegisteredTool = {
  name: string;
  description: string;
  parameters: z.ZodType;
  execute: (
    args: unknown,
    context: ToolContext,
  ) => Promise<ToolResult<unknown>>;
};

export type Tool<TArgs, TResult> = {
  name: string;
  description: string;
  parameters: z.ZodType<TArgs>;
  execute: (args: TArgs, context: ToolContext) => Promise<ToolResult<TResult>>;
};

export type BrowserDiagnostics = {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
};
