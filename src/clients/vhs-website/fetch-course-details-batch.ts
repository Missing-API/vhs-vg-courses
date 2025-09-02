"use cache";

import logger from "@/logging/logger";
import { withCategory } from "@/logging/helpers";
import { fetchCourseDetails } from "./fetch-course-details";
import type { CourseDetails } from "./course-details.schema";
import { processInBatches } from "./batch-processor";

export const MAX_CONCURRENT_DETAILS = 20;

export interface DetailsBatchResult {
  results: PromiseSettledResult<CourseDetails>[];
  succeeded: number;
  failed: number;
  durationMs: number;
}

/**
 * Fetch details for a list of courseIds with throttled concurrency.
 * Uses Promise.allSettled to be resilient to individual failures.
 */
export async function fetchCourseDetailsBatch(courseIds: string[]): Promise<DetailsBatchResult> {
  const log = withCategory(logger, "courseDetails");
  const start = process.hrtime.bigint();

  const settled = await processInBatches<string, CourseDetails>(courseIds, {
    batchSize: MAX_CONCURRENT_DETAILS,
    handler: async (id) => fetchCourseDetails(id),
    onBatchStart: (idx, items) => {
      log.debug({ operation: "details.batch", batchIndex: idx, size: items.length }, "Starting details batch");
    },
    onBatchEnd: (idx, results, durationMs) => {
      const ok = results.filter(r => r.status === "fulfilled").length;
      const ko = results.length - ok;
      log.info({ operation: "details.batch", batchIndex: idx, durationMs, ok, ko }, "Finished details batch");
    },
  });

  const end = process.hrtime.bigint();
  const durationMs = Math.round(Number(end - start) / 1_000_000);

  const succeeded = settled.filter(r => r.status === "fulfilled").length;
  const failed = settled.length - succeeded;

  if (failed > 0) {
    log.warn({ operation: "details.batch.all", succeeded, failed, durationMs }, "Some course details failed");
  } else {
    log.info({ operation: "details.batch.all", succeeded, failed, durationMs }, "All course details fetched");
  }

  return {
    results: settled,
    succeeded,
    failed,
    durationMs,
  };
}