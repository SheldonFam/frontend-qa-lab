import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";

import {
  createRun,
  executeRun,
  getAllRuns,
  getRun,
} from "../services/run.service.js";

import {
  createRunController,
  getAllRunsController,
  getRunController,
} from "./run.controller.js";

import type { TestConfiguration } from "../schemas/test-configuration.schema.js";
import type { CreateRunInput } from "../schemas/create-run.schema.js";
import type { TestRun } from "../types/run.types.js";

// Mock Run Service
vi.mock("../services/run.service.js", () => ({
  createRun: vi.fn(),
  executeRun: vi.fn(),
  getAllRuns: vi.fn(),
  getRun: vi.fn(),
}));

// Mock Express Response
function createMockResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe("createRunController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 when configuration is invalid", () => {
    // 1. Prepare invalid input
    const invalidInput = {
      configuration: {
        targetUrl: "invalid-url",
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
      requirements: "Test login functionality",
    };

    // 2. Create mock Request
    const req = {
      body: invalidInput,
    } as Request;

    // 3. Create mock Response
    const res = createMockResponse();

    // 4. Execute Controller
    createRunController(req, res, vi.fn());

    // 5. Verify HTTP status
    expect(res.status).toHaveBeenCalledWith(400);

    // 6. Verify error response
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: "VALIDATION_ERROR",
          message: "Invalid run input",
        }),
      }),
    );

    // 7. Verify Run Service was not called
    expect(createRun).not.toHaveBeenCalled();
    expect(executeRun).not.toHaveBeenCalled();
  });

  it("should return 202 and trigger run execution", () => {
    // 1. Prepare valid configuration
    const configuration: TestConfiguration = {
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
    };

    // 2. Prepare CreateRunInput
    const input: CreateRunInput = {
      configuration,
      requirements: "Test login functionality",
    };

    // 3. Prepare mock TestRun
    const mockRun: TestRun = {
      id: "run-001",
      targetUrl: configuration.targetUrl,
      status: "queued",
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      scenarios: [],
      results: [],
      requirements: input.requirements,
      testPlan: null,
      error: null,
    };

    // 4. Mock Service responses
    vi.mocked(createRun).mockReturnValue(mockRun);
    vi.mocked(executeRun).mockResolvedValue(undefined);

    // 5. Create mock Request and Response
    const req = {
      body: input,
    } as Request;

    const res = createMockResponse();

    // 6. Execute Controller
    createRunController(req, res, vi.fn());

    // 7. Verify createRun
    expect(createRun).toHaveBeenCalledWith(input);

    // 8. Verify HTTP response
    expect(res.status).toHaveBeenCalledWith(202);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockRun,
    });

    // 9. Verify background execution
    expect(executeRun).toHaveBeenCalledWith(mockRun.id, input);
  });
});

describe("getRunController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 when run does not exist", () => {
    // 1. Mock getRun
    vi.mocked(getRun).mockReturnValue(undefined);

    // 2. Create mock Request
    const req = {
      params: {
        id: "invalid-id",
      },
    } as Request<{ id: string }>;

    // 3. Create mock Response
    const res = createMockResponse();

    // 4. Execute Controller
    getRunController(req, res, vi.fn());

    // 5. Verify getRun
    expect(getRun).toHaveBeenCalledWith("invalid-id");

    // 6. Verify HTTP status
    expect(res.status).toHaveBeenCalledWith(404);

    // 7. Verify error response
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: "RUN_NOT_FOUND",
          message: "Test run not found",
        }),
      }),
    );
  });

  it("should return 200 when run exists", () => {
    // 1. Prepare mock TestRun
    const mockRun: TestRun = {
      id: "run-001",
      targetUrl: "https://example.com",
      status: "completed",
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      scenarios: [],
      results: [],
      requirements: "Test login functionality",
      testPlan: null,
      error: null,
    };

    // 2. Mock getRun
    vi.mocked(getRun).mockReturnValue(mockRun);

    // 3. Create mock Request
    const req = {
      params: {
        id: "run-001",
      },
    } as Request<{ id: string }>;

    // 4. Create mock Response
    const res = createMockResponse();

    // 5. Execute Controller
    getRunController(req, res, vi.fn());

    // 6. Verify getRun
    expect(getRun).toHaveBeenCalledWith("run-001");

    // 7. Verify HTTP status
    expect(res.status).toHaveBeenCalledWith(200);

    // 8. Verify response
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockRun,
    });
  });
});

describe("getAllRunsController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with all runs", () => {
    // 1. Prepare mock TestRun
    const mockRun: TestRun = {
      id: "run-001",
      targetUrl: "https://example.com",
      status: "completed",
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      scenarios: [],
      results: [],
      requirements: "Test login functionality",
      testPlan: null,
      error: null,
    };

    const mockRuns: TestRun[] = [mockRun];

    // 2. Mock getAllRuns
    vi.mocked(getAllRuns).mockReturnValue(mockRuns);

    // 3. Create mock Request and Response
    const req = {} as Request;
    const res = createMockResponse();

    // 4. Execute Controller
    getAllRunsController(req, res, vi.fn());

    // 5. Verify Service
    expect(getAllRuns).toHaveBeenCalledOnce();

    // 6. Verify HTTP status
    expect(res.status).toHaveBeenCalledWith(200);

    // 7. Verify response
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockRuns,
    });
  });
});

describe("createRunController scenario limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createInput(routeCount: number) {
    return {
      configuration: {
        targetUrl: "https://example.com",
        languages: ["en", "ms", "zh"],
        routes: Array.from(
          { length: routeCount },
          (_, index) => `/page-${index}`,
        ),
        viewports: [
          {
            name: "desktop",
            width: 1280,
            height: 720,
          },
          {
            name: "mobile",
            width: 390,
            height: 844,
          },
        ],
      },
      requirements: "Test login functionality",
    };
  }

  it("should return 400 when the run has more than 30 scenarios", () => {
    const routeCountForThirtySixScenarios = 6;

    const req = {
      body: createInput(routeCountForThirtySixScenarios),
    } as Request;

    const res = createMockResponse();

    createRunController(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "TOO_MANY_SCENARIOS",
        message: "A run can have at most 30 scenarios, but this one has 36",
      },
    });
    expect(createRun).not.toHaveBeenCalled();
    expect(executeRun).not.toHaveBeenCalled();
  });

  it("should accept a run with exactly 30 scenarios", () => {
    const routeCountForThirtyScenarios = 5;

    vi.mocked(createRun).mockReturnValue({ id: "run-1" } as TestRun);
    vi.mocked(executeRun).mockResolvedValue(undefined);

    const req = {
      body: createInput(routeCountForThirtyScenarios),
    } as Request;

    const res = createMockResponse();

    createRunController(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(202);
    expect(createRun).toHaveBeenCalledTimes(1);
    expect(executeRun).toHaveBeenCalledTimes(1);
  });
});
