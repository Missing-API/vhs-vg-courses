import logger from "@/logging/logger";
import { withCategory, startTimer } from "@/logging/helpers";
import { fetchCourseDetails } from "./fetch-course-details";
import type { CourseDetails } from "./course-details.schema";
import { processInBatches } from "./batch-processor";

export const MAX_CONCURRENT_DETAILS = Math.max(
  1,
  Number(process.env.VHS_BATCH_SIZE) || 10  // Moderate setting: not too high, not too low
);

export interface FetchCourseDetailsBatchOptions {
  concurrency?: number;
  batchSize?: number;
}

export interface FetchCourseDetailsBatchResult {
  detailsById: Map<string, CourseDetails>;
  stats: {
    attempted: number;
    succeeded: number;
    failed: number;
    successRate: number;
    cacheHits: number;
    durationMs: number;
  };
  errors: { id: string; error: unknown }[];
}

export async function fetchCourseDetailsBatch(
  courseIds: string[],
  options: FetchCourseDetailsBatchOptions = {}
): Promise<FetchCourseDetailsBatchResult> {

  const log = withCategory(logger, "courseProcessing");
  const end = startTimer();

  const maxConcurrent = Math.max(1, Math.min(options.concurrency || MAX_CONCURRENT_DETAILS, MAX_CONCURRENT_DETAILS));
  const initialBatchSize = Math.max(1, Math.min(options.batchSize || maxConcurrent, MAX_CONCURRENT_DETAILS));

  const { results, errors, stats } = await processInBatches<string, CourseDetails>(
    courseIds,
    async (id) => {
      return fetchCourseDetails(id);
    },
    {
      concurrency: maxConcurrent,
      batchSize: initialBatchSize,
      getKey: (id) => id,
      onBatchComplete: ({ batchIndex, settled, durationMs, batchSize }) => {
        const ok = settled.filter((s) => s?.status === "fulfilled").length;
        const fail = settled.length - ok;
        const errRate = settled.length ? fail / settled.length : 0;
        const perItemMs = settled.length ? Math.round(durationMs / settled.length) : durationMs;

        // Simple adaptive strategy:
        // - If error rate rises above 20% or items are slow (> 1200ms), reduce next batch by 25%
        // - If error rate is 0 and items are fast (< 600ms), gently increase by 10% up to maxConcurrent
        let nextBatchSize = batchSize;
        if (errRate > 0.2 || perItemMs > 1200) {
          nextBatchSize = Math.max(1, Math.floor(batchSize * 0.75));
        } else if (errRate === 0 && perItemMs < 600 && batchSize < maxConcurrent) {
          nextBatchSize = Math.min(maxConcurrent, Math.max(batchSize + 1, Math.ceil(batchSize * 1.1)));
        }

        log.debug(
          {
            operation: "courses.details.batch",
            batchIndex,
            ok,
            fail,
            durationMs,
            perItemMs,
            errRate,
            batchSize,
            nextBatchSize,
          },
          "Processed details batch"
        );

        return { nextBatchSize };
      },
    }
  );

  const detailsById = new Map<string, CourseDetails>();
  let succeeded = 0;

  results.forEach((res, i) => {
    const id = courseIds[i];
    if (res) {
      detailsById.set(id, res);
      succeeded++;
    }
  });

  const errorsDetailed = errors.map((e, i) => ({ id: courseIds[i]!, error: e }));

  const durationMs = end();
  const attempted = courseIds.length;
  const failed = attempted - succeeded;
  const successRate = attempted ? succeeded / attempted : 0;

  log.info(
    {
      operation: "courses.details.summary",
      attempted,
      succeeded,
      failed,
      cacheHits: stats.cacheHits,
      durationMs,
      maxConcurrent,
      initialBatchSize,
    },
    "Course details fetching summary"
  );

  return {
    detailsById,
    stats: {
      attempted,
      succeeded,
      failed,
      successRate,
      cacheHits: stats.cacheHits,
      durationMs,
    },
    errors: errorsDetailed,
  };
}