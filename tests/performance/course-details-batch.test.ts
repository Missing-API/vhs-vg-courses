import { describe, it, expect } from "vitest";
import { processInBatches } from "@/clients/vhs-website/batch-processor";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

describe("processInBatches performance and throttling", () => {
  it("should not exceed the specified concurrency and process all items", async () => {
    const size = 50;
    const items = Array.from({ length: size }, (_, i) => `id-${i}`);

    let active = 0;
    let maxActive = 0;

    const worker = async (id: string) => {
      active++;
      maxActive = Math.max(maxActive, active);
      // slight jitter
      await sleep(5 + (Number(id.split("-")[1]) % 5));
      active--;
      return { id, ok: true };
    };

    const concurrency = 5;
    const { results, stats } = await processInBatches(items, worker, {
      concurrency,
      batchSize: concurrency,
      getKey: (i) => i,
    });

    const fulfilled = results.filter(Boolean);
    expect(fulfilled).toHaveLength(size);
    expect(stats.succeeded).toBe(size);
    expect(stats.failed).toBe(0);
    expect(maxActive).toBeLessThanOrEqual(concurrency);
  });
});