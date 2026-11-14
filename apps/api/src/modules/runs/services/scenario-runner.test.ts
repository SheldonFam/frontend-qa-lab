import { EventEmitter } from "node:events";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Browser, BrowserContext, Page } from "playwright";

import { runScenario } from "./scenario-runner.js";

import {
  createBrowserContext,
  createPage,
} from "../../../browser/browser-manager.js";
import { mkdir } from "node:fs/promises";
import path from "node:path";

vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn(),
}));

// Mock Browser Manager
vi.mock("../../../browser/browser-manager.js", () => ({
  createBrowserContext: vi.fn(),
  createPage: vi.fn(),
}));

// Mock objects
const mockContext = {
  close: vi.fn(),
} as unknown as BrowserContext;

// Use EventEmitter to simulate Playwright Page events
const pageEvents = new EventEmitter();

const mockPage = Object.assign(pageEvents, {
  goto: vi.fn().mockResolvedValue(null),
  title: vi.fn().mockResolvedValue("About Us"),
  waitForTimeout: vi.fn().mockResolvedValue(undefined),
  locator: vi.fn(),
  screenshot: vi.fn().mockResolvedValue(Buffer.from([])),
}) as unknown as Page;

// Shared test data
const browser = {} as Browser;

const configuration = {
  targetUrl: "https://example.com",
  languages: ["en"],
  routes: ["/about"],
  viewports: [{ name: "desktop", width: 1280, height: 720 }],
};

const scenario = {
  id: "scenario-1",
  language: "en",
  route: "/about",
  viewport: {
    name: "desktop",
    width: 1280,
    height: 720,
  },
  status: "pending" as const,
};

// Reset mocks before each test
beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(mkdir).mockResolvedValue(undefined);
  vi.mocked(mockPage.screenshot).mockResolvedValue(Buffer.from([]));

  pageEvents.removeAllListeners();

  vi.mocked(createBrowserContext).mockResolvedValue(mockContext);
  vi.mocked(createPage).mockResolvedValue(mockPage);

  vi.mocked(mockPage.goto).mockResolvedValue(null);
  vi.mocked(mockPage.title).mockResolvedValue("About Us");

  // Default locator mock
  vi.mocked(mockPage.locator).mockImplementation(
    (selector) =>
      ({
        count: vi.fn().mockResolvedValue(selector === "h1" ? 1 : 0),
        evaluateAll: vi.fn().mockResolvedValue([]),
      }) as never,
  );
});

describe("runScenario", () => {
  it("should return passed when page loads successfully", async () => {
    // Act
    const runId = "run-123";

    const result = await runScenario(browser, configuration, scenario, runId);

    // Assert
    expect(result).toEqual({
      scenarioId: "scenario-1",
      status: "passed",
      url: "https://example.com/about",
      title: "About Us",
      consoleErrors: [],
      pageErrors: [],
      error: null,
      failedRequests: [],
      inputs: [],
      buttons: [],
      assertions: [
        {
          name: "page-title",
          passed: true,
          message: "Page title exists",
        },
        {
          name: "page-heading",
          passed: true,
          message: "Page heading exists",
        },
      ],
      screenshotPath: path.join(
        process.cwd(),
        "screenshots",
        runId,
        "scenario-1.png",
      ),
    });

    expect(mockContext.close).toHaveBeenCalledOnce();
  });

  it("should collect console errors and page errors", async () => {
    // Arrange
    vi.mocked(mockPage.goto).mockImplementation(async () => {
      // Simulate browser console error
      pageEvents.emit("console", {
        type: () => "error",
        text: () => "Failed to load resource",
      });

      // Simulate browser console warning
      pageEvents.emit("console", {
        type: () => "warning",
        text: () => "This is a warning",
      });

      // Simulate JavaScript runtime error
      pageEvents.emit(
        "pageerror",
        new Error("Cannot read properties of undefined"),
      );

      return null;
    });

    const runId = "run-123";

    // Act
    const result = await runScenario(browser, configuration, scenario, runId);

    // Assert
    expect(result.status).toBe("passed");

    expect(result.consoleErrors).toEqual(["Failed to load resource"]);

    expect(result.pageErrors).toEqual(["Cannot read properties of undefined"]);

    expect(mockContext.close).toHaveBeenCalledOnce();
  });

  it("should return failed when page navigation fails", async () => {
    // Arrange
    const navigationError = new Error("Navigation failed");

    vi.mocked(mockPage.goto).mockRejectedValue(navigationError);

    const runId = "run-123";
    // Act
    const result = await runScenario(browser, configuration, scenario, runId);

    // Assert
    expect(result).toEqual({
      scenarioId: "scenario-1",
      status: "failed",
      url: "https://example.com/about",
      title: null,
      consoleErrors: [],
      pageErrors: [],
      error: "Navigation failed",
      failedRequests: [],
      inputs: [],
      buttons: [],
      assertions: [],
      screenshotPath: null,
    });

    expect(mockContext.close).toHaveBeenCalledOnce();
  });

  it("should return failed when page creation fails", async () => {
    // Arrange
    vi.mocked(createPage).mockRejectedValue(new Error("Page creation failed"));

    const runId = "run-123";
    // Act
    const result = await runScenario(browser, configuration, scenario, runId);

    // Assert
    expect(result).toEqual({
      scenarioId: "scenario-1",
      status: "failed",
      url: "https://example.com/about",
      title: null,
      consoleErrors: [],
      pageErrors: [],
      error: "Page creation failed",
      failedRequests: [],
      inputs: [],
      buttons: [],
      assertions: [],
      screenshotPath: null,
    });

    expect(mockContext.close).toHaveBeenCalledOnce();
  });

  it("should capture failed network requests", async () => {
    // Arrange
    vi.mocked(mockPage.goto).mockImplementation(async () => {
      pageEvents.emit("requestfailed", {
        url: () => "https://example.com/api/fail",
      });

      return null;
    });

    const runId = "run-123";
    // Act
    const result = await runScenario(browser, configuration, scenario, runId);

    // Assert
    expect(result.failedRequests).toEqual(["https://example.com/api/fail"]);

    expect(result.status).toBe("passed");
    expect(mockContext.close).toHaveBeenCalledOnce();
  });

  it("should collect buttons and inputs", async () => {
    // Arrange
    const mockButtons = [
      { text: "Login", disabled: false },
      { text: "Register", disabled: true },
    ];

    const mockInputs = [
      {
        type: "email",
        name: "email",
        placeholder: "Enter email",
        disabled: false,
      },
    ];

    vi.mocked(mockPage.locator).mockImplementation(
      (selector) =>
        ({
          count: vi.fn().mockResolvedValue(selector === "h1" ? 1 : 0),
          evaluateAll: vi
            .fn()
            .mockResolvedValue(
              selector === "button" ? mockButtons : mockInputs,
            ),
        }) as never,
    );

    const runId = "run-123";

    // Act
    const result = await runScenario(browser, configuration, scenario, runId);

    // Assert
    expect(result.buttons).toEqual(mockButtons);
    expect(result.inputs).toEqual(mockInputs);

    expect(mockContext.close).toHaveBeenCalledOnce();
  });

  it("should fail when page title is empty", async () => {
    // Arrange
    vi.mocked(mockPage.title).mockResolvedValue("");

    const runId = "run-123";
    // Act
    const result = await runScenario(browser, configuration, scenario, runId);

    // Assert
    expect(result.status).toBe("failed");
    expect(result.assertions).toEqual([
      {
        name: "page-title",
        passed: false,
        message: "Page title is empty",
      },
      {
        name: "page-heading",
        passed: true,
        message: "Page heading exists",
      },
    ]);
  });

  it("should fail when page has no h1 heading", async () => {
    // Arrange
    vi.mocked(mockPage.locator).mockImplementation(
      (selector) =>
        ({
          count: vi.fn().mockResolvedValue(selector === "h1" ? 0 : 0),
          evaluateAll: vi.fn().mockResolvedValue([]),
        }) as never,
    );

    const runId = "run-123";
    // Act
    const result = await runScenario(browser, configuration, scenario, runId);

    // Assert
    expect(result.status).toBe("failed");

    expect(result.assertions).toEqual([
      {
        name: "page-title",
        passed: true,
        message: "Page title exists",
      },
      {
        name: "page-heading",
        passed: false,
        message: "Page heading is missing",
      },
    ]);

    expect(mockContext.close).toHaveBeenCalledOnce();
  });

  it("should capture screenshot successfully", async () => {
    const runId = "run-123";

    const result = await runScenario(browser, configuration, scenario, runId);

    const expectedPath = path.join(
      process.cwd(),
      "screenshots",
      runId,
      "scenario-1.png",
    );

    expect(mkdir).toHaveBeenCalledWith(path.dirname(expectedPath), {
      recursive: true,
    });

    expect(mockPage.screenshot).toHaveBeenCalledWith({
      path: expectedPath,
      fullPage: true,
    });

    expect(result.screenshotPath).toBe(expectedPath);
  });

  it("should return failed when screenshot fails", async () => {
    // Arrange
    vi.mocked(mockPage.screenshot).mockRejectedValue(
      new Error("Screenshot failed"),
    );

    const runId = "run-123";

    // Act
    const result = await runScenario(browser, configuration, scenario, runId);

    // Assert
    expect(result.status).toBe("failed");
    expect(result.screenshotPath).toBe(null);
    expect(result.error).toBe("Screenshot failed");

    expect(mockContext.close).toHaveBeenCalledOnce();
  });
});
