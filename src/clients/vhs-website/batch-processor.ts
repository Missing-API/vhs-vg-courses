/**
 * Generic batch processor with throttled concurrency using Promise.allSettled.
 * Processes items by chunks to cap concurrent promises.
 */
export async function processInBatches<T, R>(items: T[], opts: {
  batchSize: number;
  handler: (item: T, index: number) => Promise<R>;
  onBatchStart?: (batchIndex: number, batchItems: T[]) => void;
  onBatchEnd?: (batchIndex: number, results: PromiseSettledResult<R>[], durationMs: number) => void;
}): Promise<PromiseSettledResult<R>[]> {
  const { batchSize, handler, onBatchStart, onBatchEnd } = opts;
  if (!Array.isArray(items) || items.length === 0) return [];

  const results: PromiseSettledResult<R>[] = [];
  let batchIndex = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batchItems = items.slice(i, i + batchSize);
    onBatchStart?.(batchIndex, batchItems);
    const start = process.hrtime.bigint();
    const promises = batchItems.map((item, idx) => handler(item, i + idx));
    const settled = await Promise.allSettled(promises);
    const end = process.hrtime.bigint();
    const durationMs = Math.round(Number(end - start) / 1_000_000);
    onBatchEnd?.(batchIndex, settled, durationMs);
    results.push(...settled);
    batchIndex++;
  }

  return results;
}