import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchWithTimeout } from "./fetch-with-timeout";

describe("fetchWithTimeout", () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should make successful fetch request", async () => {
    const mockResponse = new Response("test data", { status: 200 });
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(mockResponse);

    const result = await fetchWithTimeout("https://example.com");

    expect(fetchSpy).toHaveBeenCalledWith("https://example.com", {
      signal: expect.any(AbortSignal),
      next: { 
        revalidate: 86400,
        tags: ['vhs-courses']
      },
      cache: 'force-cache'
    });
    expect(result).toBe(mockResponse);
  });

  it("should pass through init options", async () => {
    const mockResponse = new Response("test data", { status: 200 });
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(mockResponse);

    const initOptions = { method: "POST", headers: { "Content-Type": "application/json" } };
    await fetchWithTimeout("https://example.com", initOptions);

    expect(fetchSpy).toHaveBeenCalledWith("https://example.com", {
      ...initOptions,
      signal: expect.any(AbortSignal),
      next: { 
        revalidate: 86400,
        tags: ['vhs-courses']
      },
      cache: 'force-cache'
    });
  });

  it("should throw error for non-ok response", async () => {
    const mockResponse = new Response("Not Found", { status: 404, statusText: "Not Found" });
    vi.spyOn(global, "fetch").mockResolvedValue(mockResponse);

    await expect(fetchWithTimeout("https://example.com"))
      .rejects
      .toThrow("HTTP 404 Not Found for https://example.com");
  });

  it("should include response body in error message for non-ok response", async () => {
    const errorBody = "Detailed error message";
    const mockResponse = new Response(errorBody, { status: 500, statusText: "Internal Server Error" });
    mockResponse.text = vi.fn().mockResolvedValue(errorBody);
    vi.spyOn(global, "fetch").mockResolvedValue(mockResponse);

    await expect(fetchWithTimeout("https://example.com"))
      .rejects
      .toThrow("HTTP 500 Internal Server Error for https://example.com - Detailed error message");
  });

  it("should verify timeout mechanism exists", async () => {
    // Test that the function calls setTimeout with the correct timeout value
    const setTimeoutSpy = vi.spyOn(global, "setTimeout");
    const mockResponse = new Response("test", { status: 200 });
    vi.spyOn(global, "fetch").mockResolvedValue(mockResponse);

    await fetchWithTimeout("https://example.com", {}, 5000);

    // Verify setTimeout was called with the specified timeout
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
    
    setTimeoutSpy.mockRestore();
  });

  it("should use default timeout of 8 seconds", async () => {
    // Save original environment variable
    const originalTimeout = process.env.VHS_REQUEST_TIMEOUT;
    
    // Clear environment variable to test fallback
    delete process.env.VHS_REQUEST_TIMEOUT;
    
    // This test verifies the default timeout value is passed to setTimeout
    // We'll mock setTimeout to verify the timeout value
    const setTimeoutSpy = vi.spyOn(global, "setTimeout");
    const mockResponse = new Response("test", { status: 200 });
    vi.spyOn(global, "fetch").mockResolvedValue(mockResponse);

    await fetchWithTimeout("https://example.com");

    // Verify setTimeout was called with 8000ms (updated default timeout)
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 8000);
    
    setTimeoutSpy.mockRestore();
    
    // Restore original environment variable
    if (originalTimeout) {
      process.env.VHS_REQUEST_TIMEOUT = originalTimeout;
    }
  });

  it("should include Next.js cache settings", async () => {
    const mockResponse = new Response("test", { status: 200 });
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(mockResponse);

    await fetchWithTimeout("https://example.com");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://example.com",
      expect.objectContaining({
        next: { 
          revalidate: 86400, // 24 hours
          tags: ['vhs-courses']
        },
        cache: 'force-cache'
      })
    );
  });

  it("should clear timeout on successful completion", async () => {
    const mockResponse = new Response("test", { status: 200 });
    vi.spyOn(global, "fetch").mockResolvedValue(mockResponse);

    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    await fetchWithTimeout("https://example.com");

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
