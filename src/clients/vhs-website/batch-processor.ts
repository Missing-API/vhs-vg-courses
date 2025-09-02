export interface BatchStats {
  total: number;
  attempted: number;
  succeeded: number;
  failed: number;
  cacheHits: number;
  durationMs: number;
}

export interface BatchOptions<T> {
  // Chunk size for processing. Also acts as concurrency level when sequentially iterating chunks.
  batchSize?: number;
  // Maximum number of concurrent promises per batch.
  concurrency?: number;
  // Optional key to deduplicate within this run (for cache hit tracking)
  getKey?: (item: T) => string;
  // Progress callback for each batch. Can optionally suggest the next batchSize.
  onBatchComplete?: (info: {
    batchIndex: number;
    settled: PromiseSettledResult<unknown>[];
    durationMs: number;
    batchSize: number;
  }) => { nextBatchSize?: number } | void;
}

export async function processInBatches<T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
  opts: BatchOptions<T> = {}
): Promise<{ results: (R | null)[]; errors: unknown[]; stats: BatchStats }> {
  const start = process.hrtime.bigint();
  const concurrency = Math.max(1, opts.concurrency || opts.batchSize || 20);
  let currentBatchSize = Math.max(1, opts.batchSize || concurrency);
  const getKey = opts.getKey;

  const dedupe = new Map<string, Promise<R>>();
  let cacheHits = 0;

  const results: (R | null)[] = [];
  const errors: unknown[] = [];
  let succeeded = 0;

  for (let i = 0, bi = 0; i < items.length; i += currentBatchSize, bi++) {
    const batch = items.slice(i, i + currentBatchSize);

    const promises = batch.map((item) => {
      const key = getKey ? getKey(item) : undefined;
      if (key) {
        const cached = dedupe.get(key);
        if (cached) {
          cacheHits++;
          return cached;
        }
      }
      const p = worker(item);
      if (key) dedupe.set(key, p);
      return p;
    });

    const t0 = process.hrtime.bigint();
    const settled = await Promise.allSettled(promises);
    const t1 = process.hrtime.bigint();
    const batchDurationMs = Math.round(Number(t1 - t0) / 1_000_000);

    const feedback = opts.onBatchComplete?.({
      batchIndex: bi,
      settled,
      durationMs: batchDurationMs,
      batchSize: currentBatchSize,
    });

    if (feedback && typeof feedback.nextBatchSize === "number") {
      // Clamp next batch size to [1, concurrency]
      currentBatchSize = Math.max(1, Math.min(feedback.nextBatchSize, concurrency));
    }

    for (const s of settled) {
      if (s.status === "fulfilled") {
        results.push(s.value);
        succeeded++;
      } else {
        errors.push(s.reason);
        results.push(null);
      }
    }
  }

  const end = process.hrtime.bigint();
  const durationMs = Math.round(Number(end - start) / 1_000_000);
  const attempted = items.length;

  return {
    results,
    errors,
    stats: {
      total: items.length,
      attempted,
      succeeded,
      failed: attempted - succeeded,
      cacheHits,
      durationMs,
    },
  };
}