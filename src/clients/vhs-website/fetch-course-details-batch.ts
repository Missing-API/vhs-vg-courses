import logger from "@/logging/logger";
import { withCategory, startTimer } from "@/logging/helpers";
import { fetchCourseDetails } from "./fetch-course-details";
import type { CourseDetails } from "./course-details.schema";
import { processInBatches } from "./batch-processor";

export const MAX_RETRY_ATTEMPTS = 3;
export const MAX_CONCURRENT_DETAILS = 40; // Increased from 25 to 40 for maximum parallelization

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
      // Retry logic with exponential backoff
      let lastError: unknown;
      const courseUrl = `https://www.vhs-vg.de/kurse/kurs/${id}`;
      
      for (let attempt = 1; attempt <= 2; attempt++) { // Reduced from 3 to 2 attempts
        try {
          if (attempt > 1) {
            // Faster retry: wait only 25ms on second attempt
            const delay = 25;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          // Remove random delay for better performance - only used for retry backoff
          // const randomDelay = Math.random() * 50; // 0-50ms random delay
          // await new Promise(resolve => setTimeout(resolve, randomDelay));
          
          return await fetchCourseDetails(id);
        } catch (error) {
          lastError = error;
          
          // Log detailed error information for analysis
          const errorInfo: any = {
            operation: "course.detail.fetch.attempt",
            courseId: id,
            courseUrl,
            attempt,
            maxAttempts: 2
          };
          
          if (error instanceof Error) {
            errorInfo.errorMessage = error.message;
            
            // Extract HTTP status from error message if available
            const statusMatch = error.message.match(/HTTP (\d+)/);
            if (statusMatch) {
              errorInfo.httpStatus = parseInt(statusMatch[1]);
            }
            
            // Check for timeout errors
            if (error.message.includes('aborted') || error.message.includes('timeout')) {
              errorInfo.errorType = 'timeout';
            } else if (error.message.includes('HTTP')) {
              errorInfo.errorType = 'http_error';
            } else {
              errorInfo.errorType = 'other';
            }
          }
          
          if (attempt === 2) {
            log.error(errorInfo, `Failed to fetch course details after ${attempt} attempts`);
          } else {
            log.warn(errorInfo, `Course detail fetch attempt ${attempt} failed, retrying`);
          }
          
          // Don't retry on validation errors (invalid course ID format)
          if (error instanceof Error && error.message.includes('Invalid course id format')) {
            throw error;
          }
          // On last attempt, throw the error
          if (attempt === 2) {
            throw error;
          }
          // Continue to next attempt for other errors (timeouts, network issues)
        }
      }
      throw lastError;
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

        // Ultra-aggressive adaptive strategy for speed:
        // - If error rate rises above 40% or items are extremely slow (> 3000ms), reduce batch by 25%
        // - If error rate is low (<= 15%) and items are fast (< 2000ms), increase by 50% up to maxConcurrent
        let nextBatchSize = batchSize;
        if (errRate > 0.4 || perItemMs > 3000) {
          nextBatchSize = Math.max(1, Math.floor(batchSize * 0.75));
        } else if (errRate <= 0.15 && perItemMs < 2000 && batchSize < maxConcurrent) {
          nextBatchSize = Math.min(maxConcurrent, Math.max(batchSize + 5, Math.ceil(batchSize * 1.5)));
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

  // Analyze failure patterns
  if (failed > 0) {
    const failureAnalysis: any = {
      operation: "courses.details.failure.analysis", 
      totalFailed: failed,
      failedCourses: []
    };
    
    errorsDetailed.forEach(({ id, error }) => {
      const courseInfo: any = {
        courseId: id,
        courseUrl: `https://www.vhs-vg.de/kurse/kurs/${id}`
      };
      
      if (error instanceof Error) {
        courseInfo.errorMessage = error.message;
        
        // Extract HTTP status from error message if available
        const statusMatch = error.message.match(/HTTP (\d+)/);
        if (statusMatch) {
          courseInfo.httpStatus = parseInt(statusMatch[1]);
        }
        
        // Categorize error type
        if (error.message.includes('aborted') || error.message.includes('timeout')) {
          courseInfo.errorType = 'timeout';
        } else if (error.message.includes('HTTP')) {
          courseInfo.errorType = 'http_error';
        } else if (error.message.includes('Invalid course id format')) {
          courseInfo.errorType = 'invalid_id';
        } else {
          courseInfo.errorType = 'other';
        }
      }
      
      failureAnalysis.failedCourses.push(courseInfo);
    });
    
    log.warn(failureAnalysis, `Failed to fetch details for ${failed} course(s) - detailed analysis`);
  }

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