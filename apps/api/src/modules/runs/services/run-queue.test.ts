import { beforeEach, describe, expect, it, vi } from "vitest";

import { addRunToQueue, stopRun } from "./run-queue.js";
import { executeRun } from "./run.service.js";

import type { CreateRunInput } from "../schemas/create-run.schema.js";

vi.mock("./run.service.js", () => ({
  executeRun: vi.fn(),
}));

const input: CreateRunInput = {
  configuration: {
    targetUrl: "https://example.com",
    languages: ["en"],
    routes: ["/"],
    viewports: [
      {
        name: "desktop",
        width: 1280,
        height: 720,
      },
    ],
  },
  requirements: "Check the home page.",
};

function createControlledRun() {
  let finish: () => void = () => {};
  let fail: (error: Error) => void = () => {};

  const promise = new Promise<void>((resolve, reject) => {
    finish = resolve;
    fail = reject;
  });

  return { promise, finish, fail };
}

function getSignalOfStartedRun(callIndex: number): AbortSignal {
  const options = vi.mocked(executeRun).mock.calls[callIndex]?.[2];

  if (!options?.signal) {
    throw new Error("The run was started without a signal");
  }

  return options.signal;
}

function waitForQueue(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe("run queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should start a run at once when nothing else is running", async () => {
    vi.mocked(executeRun).mockResolvedValue(undefined);

    addRunToQueue("run-1", input);

    expect(executeRun).toHaveBeenCalledTimes(1);
    expect(executeRun).toHaveBeenCalledWith("run-1", input, {
      signal: expect.any(AbortSignal),
    });

    await waitForQueue();
  });

  it("should make the second run wait until the first one is finished", async () => {
    const firstRun = createControlledRun();

    vi.mocked(executeRun)
      .mockReturnValueOnce(firstRun.promise)
      .mockResolvedValue(undefined);

    addRunToQueue("run-1", input);
    addRunToQueue("run-2", input);

    await waitForQueue();

    expect(executeRun).toHaveBeenCalledTimes(1);
    expect(executeRun).toHaveBeenLastCalledWith("run-1", input, {
      signal: expect.any(AbortSignal),
    });

    firstRun.finish();

    await waitForQueue();

    expect(executeRun).toHaveBeenCalledTimes(2);
    expect(executeRun).toHaveBeenLastCalledWith("run-2", input, {
      signal: expect.any(AbortSignal),
    });
  });

  it("should start waiting runs in the order they were added", async () => {
    vi.mocked(executeRun).mockResolvedValue(undefined);

    addRunToQueue("run-1", input);
    addRunToQueue("run-2", input);
    addRunToQueue("run-3", input);

    await waitForQueue();

    const startedRunIds = vi
      .mocked(executeRun)
      .mock.calls.map(([runId]) => runId);

    expect(startedRunIds).toEqual(["run-1", "run-2", "run-3"]);
  });

  it("should start the next run when the current one fails", async () => {
    const firstRun = createControlledRun();

    vi.mocked(executeRun)
      .mockReturnValueOnce(firstRun.promise)
      .mockResolvedValue(undefined);

    addRunToQueue("run-1", input);
    addRunToQueue("run-2", input);

    firstRun.fail(new Error("Browser launch failed"));

    await waitForQueue();

    expect(executeRun).toHaveBeenCalledTimes(2);
    expect(executeRun).toHaveBeenLastCalledWith("run-2", input, {
      signal: expect.any(AbortSignal),
    });
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("should not start a waiting run that was stopped", async () => {
    const firstRun = createControlledRun();

    vi.mocked(executeRun)
      .mockReturnValueOnce(firstRun.promise)
      .mockResolvedValue(undefined);

    addRunToQueue("run-1", input);
    addRunToQueue("run-2", input);
    addRunToQueue("run-3", input);

    stopRun("run-2");

    firstRun.finish();

    await waitForQueue();

    const startedRunIds = vi
      .mocked(executeRun)
      .mock.calls.map(([runId]) => runId);

    expect(startedRunIds).toEqual(["run-1", "run-3"]);
    expect(getSignalOfStartedRun(0).aborted).toBe(false);
  });

  it("should tell the running run to stop", async () => {
    const firstRun = createControlledRun();

    vi.mocked(executeRun).mockReturnValueOnce(firstRun.promise);

    addRunToQueue("run-1", input);

    const signal = getSignalOfStartedRun(0);

    expect(signal.aborted).toBe(false);

    stopRun("run-1");

    expect(signal.aborted).toBe(true);

    firstRun.finish();

    await waitForQueue();
  });

  it("should leave the running run alone when another run is stopped", async () => {
    const firstRun = createControlledRun();

    vi.mocked(executeRun).mockReturnValueOnce(firstRun.promise);

    addRunToQueue("run-1", input);

    stopRun("run-unknown");

    expect(getSignalOfStartedRun(0).aborted).toBe(false);

    firstRun.finish();

    await waitForQueue();
  });

  it("should give each run its own signal", async () => {
    const firstRun = createControlledRun();

    vi.mocked(executeRun)
      .mockReturnValueOnce(firstRun.promise)
      .mockResolvedValue(undefined);

    addRunToQueue("run-1", input);
    addRunToQueue("run-2", input);

    stopRun("run-1");

    firstRun.finish();

    await waitForQueue();

    expect(getSignalOfStartedRun(0).aborted).toBe(true);
    expect(getSignalOfStartedRun(1).aborted).toBe(false);
  });
});
