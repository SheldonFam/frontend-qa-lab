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
    // 1. Create mock Request
    const req = {
      body: {},
    } as Request;

    // 2. Create mock Response
    const res = createMockResponse();

    // 3. Execute Controller
    createRunController(req, res, vi.fn());

    // 4. Verify HTTP status
    expect(res.status).toHaveBeenCalledWith(400);

    // 5. Verify error response
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: "VALIDATION_ERROR",
          message: "Invalid test configuration",
        }),
      }),
    );

    // 6. Verify Run Service was not called
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

    // 2. Prepare mock TestRun
    const mockRun: TestRun = {
      id: "run-001",
      targetUrl: configuration.targetUrl,
      status: "queued",
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      scenarios: [],
      results: [],
    };

    // 3. Mock Service responses
    vi.mocked(createRun).mockReturnValue(mockRun);
    vi.mocked(executeRun).mockResolvedValue(undefined);

    // 4. Create mock Request and Response
    const req = {
      body: configuration,
    } as Request;

    const res = createMockResponse();

    // 5. Execute Controller
    createRunController(req, res, vi.fn());

    // 6. Verify createRun
    expect(createRun).toHaveBeenCalledWith(configuration);

    // 7. Verify HTTP response
    expect(res.status).toHaveBeenCalledWith(202);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockRun,
    });

    // 8. Verify background execution
    expect(executeRun).toHaveBeenCalledWith(mockRun.id, configuration);
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
});
