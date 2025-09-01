// Generic batch processing utility for async operations with progress and error handling.

import logger from "@/logging/logger";
import { withCategory, startTimer, errorToObject } from "@/logging/helpers";

export interface BatchOptions<T = unknown> {
  batchSize: number;
  concurrency: "sequential" | "parallel";
  onProgress?: (completed: number, total: number) => void;
  onError?: (error: Error, item: T) => void;
  label?: string; // for logging
}

export interface BatchError<T> {
  item: T;
  error: Error;
}

export interface BatchResult<R, T = unknown> {
  results: R[];
  errors: BatchError<T>[];
  completed: number;
  total: number;
  durationMs: number;
}

export function makeBatches<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

/**
 * Process items in batches with either sequential or parallel batch execution.
 * Each batch processes up to batchSize items concurrently using Promise.allSettled.
 */
export async function processBatches<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: BatchOptions<T>
): Promise<BatchResult<R, T>> {
  const total = items.length;
  const end = startTimer();
  const log = withCategory(logger, "batch");

  const batchSize = Math.max(1, options.batchSize || 1);
  const batches = makeBatches(items, batchSize);

  let completed = 0;
  const allResults: R[] = [];
  const allErrors: BatchError<T>[] = [];

  async function processSingleBatch(batch: T[], index: number) {
    const batchStart = startTimer();
    const label = options.label || "batch";
    log.debug({ operation: "batch.start", label, index, size: batch.length }, "Processing batch");
    const settled = await Promise.allSettled(batch.map((item) => processor(item)));

    for (let i = 0; i < settled.length; i++) {
      const s = settled[i];
      const item = batch[i];
      if (s.status === "fulfilled") {
        allResults.push(s.value);
      } else {
        const err = s.reason instanceof Error ? s.reason : new Error(String(s.reason));
        allErrors.push({ item, error: err });
        options.onError?.(err, item);
      }
      completed++;
      options.onProgress?.(completed, total);
    }
    const durationMs = batchStart();
    log.info({ operation: "batch.done", label, index, size: batch.length, durationMs }, "Batch processed");
  }

  if (options.concurrency === "parallel") {
    await Promise.all(batches.map((b, i) => processSingleBatch(b, i)));
  } else {
    for (let i = 0; i < batches.length; i++) {
      await processSingleBatch(batches[i], i);
    }
  }

  const durationMs = end();
  const label = options.label || "batch";
  log.info(
    {
      operation: "batch.summary",
      label,
      total,
      results: allResults.length,
      errors: allErrors.length,
      durationMs,
    },
    "Batch processing summary"
  );

  return { results: allResults, errors: allErrors, completed, total, durationMs };
}