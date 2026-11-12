import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Browser, BrowserContext, Page } from "playwright";

import { runScenario } from "./scenario-runner.js";

import {
  createBrowserContext,
  createPage,
} from "../../../browser/browser-manager.js";

// Mock Browser Manager
vi.mock("../../../browser/browser-manager.js", () => ({
  createBrowserContext: vi.fn(),
  createPage: vi.fn(),
}));

// Mock objects
const mockContext = {
  close: vi.fn(),
} as unknown as BrowserContext;

const mockPage = {
  goto: vi.fn().mockResolvedValue(null),
  title: vi.fn().mockResolvedValue("About Us"),
} as unknown as Page;

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
  vi.clearAllMocks();
});

describe("runScenario", () => {
  it("should return passed when page loads successfully", async () => {
    // Arrange
    vi.mocked(createBrowserContext).mockResolvedValue(mockContext);
    vi.mocked(createPage).mockResolvedValue(mockPage);

    // Act
    const result = await runScenario(browser, configuration, scenario);

    // Assert
    expect(result).toEqual({
      scenarioId: "scenario-1",
      status: "passed",
      url: "https://example.com/about",
      title: "About Us",
      error: null,
    });

    expect(mockContext.close).toHaveBeenCalledOnce();
  });

  it("should return failed when page navigation fails", async () => {
    // Arrange
    vi.mocked(createBrowserContext).mockResolvedValue(mockContext);
    vi.mocked(createPage).mockResolvedValue(mockPage);

    vi.mocked(createPage);
    vi.mocked(createBrowserContext);

    // Make navigation fail
    const navigationError = new Error("Navigation failed");

    const gotoMock = mockPage.goto as unknown as ReturnType<typeof vi.fn>;
    gotoMock.mockRejectedValue(navigationError);

    // Act
    const result = await runScenario(browser, configuration, scenario);

    // Assert
    expect(result).toEqual({
      scenarioId: "scenario-1",
      status: "failed",
      url: "https://example.com/about",
      title: null,
      error: "Navigation failed",
    });

    expect(mockContext.close).toHaveBeenCalledOnce();
  });

  it("should return failed when page creation fails", async () => {
    // Arrange
    vi.mocked(createBrowserContext).mockResolvedValue(mockContext);

    vi.mocked(createPage).mockRejectedValue(new Error("Page creation failed"));

    // Act
    const result = await runScenario(browser, configuration, scenario);

    // Assert
    expect(result).toEqual({
      scenarioId: "scenario-1",
      status: "failed",
      url: "https://example.com/about",
      title: null,
      error: "Page creation failed",
    });

    expect(mockContext.close).toHaveBeenCalledOnce();
  });
});
