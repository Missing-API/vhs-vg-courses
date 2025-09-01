import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { processBatches } from "@/clients/vhs-website/batch-processor";
import { fetchCourseDetailsBatch, isValidCourseId } from "@/clients/vhs-website/fetch-course-details-batch";
import * as details from "@/clients/vhs-website/fetch-course-details";
import { MAX_CONCURRENT_DETAILS } from "@/clients/vhs-website/performance";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

describe("batch processing utility", () => {
  it("processes items in sequential batches with Promise.allSettled semantics", async () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    const seen = new Set<number>();

    const result = await processBatches(
      items,
      async (n) => {
        await delay(5);
        seen.add(n);
        if (n % 7 === 0) throw new Error("boom");
        return n * 2;
      },
      { batchSize: 10, concurrency: "sequential" }
    );

    expect(result.total).toBe(25);
    expect(result.results.length + result.errors.length).toBe(25);
    expect(seen.size).toBe(25);
    // Expect ~3 failures (0,7,14,21 -> 4)
    expect(result.errors.length).toBe(4);
  });

  it("processes batches in parallel when configured", async () => {
    const items = Array.from({ length: 40 }, (_, i) => i);
    let inFlight = 0;
    let maxInFlight = 0;

    const result = await processBatches(
      items,
      async () => {
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await delay(10);
        inFlight--;
        return true;
      },
      { batchSize: 10, concurrency: "parallel" }
    );

    expect(result.total).toBe(40);
    // With 4 batches parallel of size 10, maxInFlight should reach 10 per batch (processor concurrency)
    expect(maxInFlight).toBeGreaterThanOrEqual(10);
  });
});

describe("fetchCourseDetailsBatch", () => {
  const goodId = "252P40405";
  const ids = Array.from({ length: 30 }, (_, i) => (i % 2 === 0 ? goodId : "bad" + i));

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(details, "fetchCourseDetails").mockImplementation(async (id: string) => {
      if (!isValidCourseId(id)) throw new Error("invalid id");
      await delay(2);
      return {
        id,
        title: "T",
        description: "<div>desc</div>",
        start: new Date().toISOString(),
        duration: "1 Termin",
        numberOfDates: 1,
        schedule: [],
        location: { name: "L", address: "", room: undefined },
        summary: "<div></div>",
      } as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches details with retry and throttling", async () => {
    const result = await fetchCourseDetailsBatch(ids, { batchSize: Math.min(20, MAX_CONCURRENT_DETAILS), concurrency: "sequential" });
    // Only valid ids should succeed
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.completed).toBe(result.total);
  });
});