import { executeRun } from "./run.service.js";

import type { CreateRunInput } from "../schemas/create-run.schema.js";

type WaitingRun = {
  runId: string;
  input: CreateRunInput;
};

const waitingRuns: WaitingRun[] = [];

let isProcessing = false;

async function processQueue(): Promise<void> {
  if (isProcessing) {
    return;
  }

  isProcessing = true;

  while (waitingRuns.length > 0) {
    const nextRun = waitingRuns.shift();

    if (!nextRun) {
      break;
    }

    try {
      await executeRun(nextRun.runId, nextRun.input);
    } catch (error: unknown) {
      console.error(`Failed to execute run ${nextRun.runId}:`, error);
    }
  }

  isProcessing = false;
}

export function addRunToQueue(runId: string, input: CreateRunInput): void {
  waitingRuns.push({ runId, input });

  void processQueue();
}
