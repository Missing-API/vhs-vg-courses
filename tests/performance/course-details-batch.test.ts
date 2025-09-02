import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetchCourseDetails to control timing and track concurrency
vi.mock("@/clients/vhs-website/fetch-course-details", () => {
  let inFlight = 0;
  let maxInFlight = 0;

  async function delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  return {
    fetchCourseDetails: vi.fn(async (id: string) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      // vary delay a bit based on id to simulate network
      const ms = 20 + (parseInt(id.replace(/\D/g, ""), 10) % 10);
      await delay(ms);
      inFlight--;
      return {
        id,
        title: `Title ${id}`,
        description: "<div>desc</div>",
        start: new Date().toISOString(),
        duration: "10 Termine",
        numberOfDates: 10,
        schedule: [],
        location: { name: "x", address: "", room: undefined },
        summary: "<div>sum</div>",
      };
    }),
    // helpers to inspect state from test
    __getMaxInFlight: () => maxInFlight,
    __reset: () => { inFlight = 0; maxInFlight = 0; },
  };
});

import { fetchCourseDetailsBatch, MAX_CONCURRENT_DETAILS } from "@/clients/vhs-website/fetch-course-details-batch";
import * as mockedModule from "@/clients/vhs-website/fetch-course-details";

describe("fetchCourseDetailsBatch performance", () => {
  beforeEach(() => {
    (mockedModule as any).__reset?.();
    vi.clearAllMocks();
  });

  it("should cap concurrency to MAX_CONCURRENT_DETAILS and return all results", async () => {
    const n = 57;
    const ids = Array.from({ length: n }).map((_, i) => {
      const id = 100 + (i % 500);
      // Create plausible ids like 252A00123
      return `${id}A${String(10000 + i).slice(-5)}`;
    });

    const result = await fetchCourseDetailsBatch(ids);

    expect(result.results).toHaveLength(n);
    expect(result.succeeded).toBe(n);
    expect(result.failed).toBe(0);

    const maxInFlight = (mockedModule as any).__getMaxInFlight?.();
    expect(maxInFlight).toBeLessThanOrEqual(MAX_CONCURRENT_DETAILS);
  });
});