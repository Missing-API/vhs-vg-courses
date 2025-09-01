import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkVhsWebsiteHealth } from "./check-vhs-website-health";

// Mock global fetch
const originalFetch = global.fetch;

function mockFetchOnce(response: Partial<Response> & { bodyText?: string } = {}) {
  const { bodyText = "<html><head></head><body></body></html>", ...rest } = response;
  const res = {
    ok: response.ok ?? true,
    status: response.status ?? 200,
    statusText: response.statusText ?? "OK",
    headers: new Headers(response.headers ?? {}),
    text: vi.fn().mockResolvedValue(bodyText),
  } as unknown as Response;

  (global as any).fetch = vi.fn().mockResolvedValue({
    ...res,
    ...rest,
  });
}

describe("checkVhsWebsiteHealth", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    vi.useRealTimers();
    vi.clearAllTimers();
    vi.resetAllMocks();
  });

  it("returns healthy when HEAD succeeds quickly", async () => {
    mockFetchOnce({ ok: true, status: 200 });

    const promise = checkVhsWebsiteHealth(5000);
    // advance timers to allow immediate resolution
    const result = await promise;

    expect(result.status).toBe("healthy");
    expect(result.statusCode).toBe(200);
    expect(typeof result.responseTime).toBe("number");
    expect(result.message).toMatch(/accessible|reachable/i);
    expect(new Date(result.timestamp).toString()).not.toBe("Invalid Date");
  });

  it("falls back to GET when HEAD fails and validates HTML", async () => {
    // First call (HEAD) rejects, second call (GET) resolves with HTML
    let call = 0;
    (global as any).fetch = vi.fn().mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return Promise.reject(new Error("Method not allowed"));
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        text: vi.fn().mockResolvedValue("<html><head></head><body></body></html>"),
      } as unknown as Response);
    });

    const result = await checkVhsWebsiteHealth(5000);
    expect(result.status).toBe("healthy");
    expect(result.statusCode).toBe(200);
  });

  it("returns degraded when response is slow but ok", async () => {
    // HEAD ok but simulate slowness by delaying resolution near timeout
    (global as any).fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              statusText: "OK",
              headers: new Headers(),
              text: vi.fn().mockResolvedValue("<html><head></head><body></body></html>"),
            } as unknown as Response);
          }, 11000); // 11 seconds to trigger degraded classification threshold (10s)
        })
    );

    const promise = checkVhsWebsiteHealth(15000);
    // fast-forward time
    await vi.advanceTimersByTimeAsync(11000);

    const result = await promise;
    expect(result.status).toBe("degraded");
    expect(result.statusCode).toBe(200);
  });

  it("returns unhealthy on HTTP error status", async () => {
    // HEAD ok=false triggers GET path, but let's make GET also fail with 500
    let call = 0;
    (global as any).fetch = vi.fn().mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
          headers: new Headers(),
          text: vi.fn().mockResolvedValue(""),
        } as unknown as Response);
      }
      return Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers(),
        text: vi.fn().mockResolvedValue(""),
      } as unknown as Response);
    });

    const result = await checkVhsWebsiteHealth(5000);
    expect(result.status).toBe("unhealthy");
    expect(result.statusCode).toBe(500);
    expect(result.message).toMatch(/HTTP 500/i);
  });

  it("returns unhealthy on timeout", async () => {
    // Mock fetch to reject with AbortError after a delay
    (global as any).fetch = vi.fn().mockImplementation(
      () => Promise.reject(new Error("AbortError"))
    );

    const result = await checkVhsWebsiteHealth(5); // 5ms timeout
    expect(result.status).toBe("unhealthy");
    expect(result.statusCode).toBeNull();
    expect(result.message).toMatch(/timeout/i);
  });

  it("returns degraded if GET ok but body lacks basic HTML", async () => {
    // Fail HEAD then succeed GET with non-HTML body
    let call = 0;
    (global as any).fetch = vi.fn().mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return Promise.reject(new Error("HEAD not supported"));
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        text: vi.fn().mockResolvedValue("{}"),
      } as unknown as Response);
    });

    const result = await checkVhsWebsiteHealth(5000);
    expect(result.status).toBe("degraded");
    expect(result.statusCode).toBe(200);
    expect(result.message).toMatch(/without expected HTML/i);
  });
});