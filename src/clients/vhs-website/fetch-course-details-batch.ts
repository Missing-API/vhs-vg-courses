import logger from "@/logging/logger";
import { withCategory, startTimer } from "@/logging/helpers";
import { fetchCourseDetails } from "./fetch-course-details";
import type { CourseDetails } from "./course-details.schema";
import { processInBatches } from "./batch-processor";

export const MAX_CONCURRENT_DETAILS = 20;

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
  "use cache";

  const log = withCategory(logger, "courseProcessing");
  const end = startTimer();

  const concurrency = Math.min(options.concurrency || MAX_CONCURRENT_DETAILS, MAX_CONCURRENT_DETAILS);
  const batchSize = Math.max(1, Math.min(options.batchSize || concurrency, MAX_CONCURRENT_DETAILS));

  const { results, errors, stats } = await processInBatches<string, CourseDetails>(
    courseIds,
    async (id) => {
      return fetchCourseDetails(id);
    },
    {
      concurrency,
      batchSize,
      getKey: (id) => id,
      onBatchComplete: ({ batchIndex, settled, durationMs }) => {
        const ok = settled.filter((s) => s?.status === "fulfilled").length;
        const fail = settled.length - ok;
        log.debug(
          { operation: "courses.details.batch", batchIndex, ok, fail, durationMs },
          "Processed details batch"
        );
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
    { operation: "courses.details.summary", attempted, succeeded, failed, cacheHits: stats.cacheHits, durationMs },
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