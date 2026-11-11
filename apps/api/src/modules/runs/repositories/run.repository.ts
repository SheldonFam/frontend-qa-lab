import type { TestRun } from "../types/run.types.js";

const runs: TestRun[] = [];

export const runRepository = {
  create(testRun: TestRun): TestRun {
    runs.push(testRun);

    return testRun;
  },

  findById(id: string): TestRun | undefined {
    return runs.find((run) => run.id === id);
  },

  findAll(): TestRun[] {
    return [...runs];
  },

  update(
    id: string,
    updates: Partial<
      Pick<TestRun, "status" | "startedAt" | "completedAt" | "scenarios">
    >,
  ): TestRun | undefined {
    const run = runs.find((item) => item.id === id);

    if (!run) {
      return undefined;
    }

    Object.assign(run, updates);

    return run;
  },
};
