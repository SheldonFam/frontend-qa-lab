import { executeRun } from "./run.service.js";

import type { CreateRunInput } from "../schemas/create-run.schema.js";

type WaitingRun = {
  runId: string;
  input: CreateRunInput;
};

type RunningRun = {
  runId: string;
  abortController: AbortController;
};

const waitingRuns: WaitingRun[] = [];

let runningRun: RunningRun | null = null;
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

    const abortController = new AbortController();

    runningRun = { runId: nextRun.runId, abortController };

    try {
      await executeRun(nextRun.runId, nextRun.input, {
        signal: abortController.signal,
      });
    } catch (error: unknown) {
      console.error(`Failed to execute run ${nextRun.runId}:`, error);
    }

    runningRun = null;
  }

  isProcessing = false;
}

export function addRunToQueue(runId: string, input: CreateRunInput): void {
  waitingRuns.push({ runId, input });

  void processQueue();
}

export function stopRun(runId: string): void {
  const waitingIndex = waitingRuns.findIndex(
    (waitingRun) => waitingRun.runId === runId,
  );

  if (waitingIndex !== -1) {
    waitingRuns.splice(waitingIndex, 1);
    return;
  }

  if (runningRun?.runId === runId) {
    runningRun.abortController.abort();
  }
}
