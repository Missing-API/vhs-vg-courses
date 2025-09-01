// Performance/tuning configuration with sensible defaults and env overrides.

export const COURSE_DETAIL_CONFIG = {
  MAX_CONCURRENT_DETAILS: Number(process.env.COURSE_DETAIL_CONCURRENCY || 20),
  BATCH_SIZE: Number(process.env.COURSE_DETAIL_BATCH_SIZE || 20),
  DETAIL_TIMEOUT_MS: Number(process.env.COURSE_DETAIL_TIMEOUT || 10_000),
  CACHE_WARMING_ENABLED: (process.env.COURSE_DETAIL_CACHE_WARMING || "true").toLowerCase() === "true",
  RETRY_ATTEMPTS: Number(process.env.COURSE_DETAIL_RETRY_ATTEMPTS || 3),
  RETRY_DELAY_MS: Number(process.env.COURSE_DETAIL_RETRY_DELAY_MS || 1000),
} as const;

// Named constant per spec for easier import in modules/tests
export const MAX_CONCURRENT_DETAILS = COURSE_DETAIL_CONFIG.MAX_CONCURRENT_DETAILS;