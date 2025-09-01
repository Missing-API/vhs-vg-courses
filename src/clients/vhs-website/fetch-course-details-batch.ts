"use cache";

import logger from "@/logging/logger";
import { withCategory, startTimer, errorToObject } from "@/logging/helpers";
import { fetchCourseDetails } from "./fetch-course-details";
import { processBatches } from "./batch-processor";
import type { BatchResult } from "./batch-processor";
import { COURSE_DETAIL_CONFIG } from "./performance";
import type { CourseDetails } from "./course-details.schema";

export interface DetailsBatchOptions {
  batchSize?: number;
  concurrency?: "sequential" | "parallel";
  timeoutMs?: number;
  retryAttempts?: number;
  retryDelayMs?: number;
  circuitBreakerFailures?: number; // stop after N failures (best-effort)
}

/**
 * Validate known VHS course id format.
 */
export function isValidCourseId(id: string): boolean {
  return /^[0-9]{3}[A-Z][0-9]{5}$/i.test(id);
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts: number,
  delayMs: number
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await sleep(delayMs * Math.pow(2, i)); // exponential backoff
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

/**
 * Fetch course details for many ids with batching, throttling, retry and basic circuit breaker.
 */
export async function fetchCourseDetailsBatch(
  ids: string[],
  opts?: DetailsBatchOptions
): Promise<BatchResult<CourseDetails, string>> {
  const log = withCategory(logger, "courseDetailsBatch");
  const end = startTimer();

  const cfg = {
    batchSize: opts?.batchSize ?? COURSE_DETAIL_CONFIG.BATCH_SIZE,
    concurrency: opts?.concurrency ?? "sequential", // default: play nice
    timeoutMs: opts?.timeoutMs ?? COURSE_DETAIL_CONFIG.DETAIL_TIMEOUT_MS,
    retryAttempts: opts?.retryAttempts ?? COURSE_DETAIL_CONFIG.RETRY_ATTEMPTS,
    retryDelayMs: opts?.retryDelayMs ?? COURSE_DETAIL_CONFIG.RETRY_DELAY_MS,
    circuitBreakerFailures: opts?.circuitBreakerFailures ?? Math.max(10, COURSE_DETAIL_CONFIG.MAX_CONCURRENT_DETAILS),
  };

  const validIds = ids.filter(isValidCourseId);
  const total = validIds.length;
  let failures = 0;

  const result = await processBatches<string, CourseDetails>(
    validIds,
    async (id) => {
      // Circuit breaker: if too many failures so far, abort quickly
      if (failures >= cfg.circuitBreakerFailures) {
        const err = new Error("Circuit breaker open: too many failures");
        (err as any).code = "CIRCUIT_OPEN";
        throw err;
      }
      try {
        const detail = await withRetry(() => fetchCourseDetails(id), cfg.retryAttempts, cfg.retryDelayMs);
        return detail;
      } catch (err) {
        failures++;
        throw err instanceof Error ? err : new Error(String(err));
      }
    },
    {
      batchSize: Math.max(1, Math.min(cfg.batchSize, COURSE_DETAIL_CONFIG.MAX_CONCURRENT_DETAILS)),
      concurrency: cfg.concurrency,
      label: "courseDetails",
      onProgress: (completed, tot) => {
        if (completed % Math.max(5, Math.floor(tot / 10) || 1) === 0) {
          log.debug({ operation: "details.progress", completed, total: tot }, "Detail progress");
        }
      },
      onError: (error, item) => {
        log.warn({ operation: "details.error", id: item, err: errorToObject(error) }, "Detail fetch failed");
      },
    }
  );

  const durationMs = end();
  log.info(
    {
      operation: "details.summary",
      requested: total,
      succeeded: result.results.length,
      failed: result.errors.length,
      durationMs,
    },
    "Fetched course details in batch"
  );

  return result;
}

/**
 * Fire-and-forget cache warming: kicks off background fetching of details for ids.
 * This leverages Next.js caching inside fetchCourseDetails via fetch() revalidate.
 */
export function warmCourseDetailsCache(ids: string[], opts?: DetailsBatchOptions) {
  if (!COURSE_DETAIL_CONFIG.CACHE_WARMING_ENABLED) return;

  const log = withCategory(logger, "courseDetailsBatch");
  const cfg = {
    ...opts,
    concurrency: "sequential" as const,
    batchSize: Math.min(COURSE_DETAIL_CONFIG.BATCH_SIZE, COURSE_DETAIL_CONFIG.MAX_CONCURRENT_DETAILS),
  };

  // Detach the promise chain; log any top-level error
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  (async () => {
    const validIds = ids.filter(isValidCourseId);
    if (validIds.length === 0) return;
    log.info({ operation: "details.warm.start", count: validIds.length }, "Starting cache warming for details");
    try {
      await fetchCourseDetailsBatch(validIds, cfg);
      log.info({ operation: "details.warm.done", count: validIds.length }, "Cache warming completed");
    } catch (err) {
      log.error({ operation: "details.warm.error", err: errorToObject(err) }, "Cache warming failed");
    }
  })();
}