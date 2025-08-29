import { describe, it, beforeEach, expect, vi } from 'vitest';
import {
  getCacheControlHeader,
  getConfigCacheControlHeader,
  getDataCacheControlHeader,
} from './cache-control-header';

describe('Cache Control Header', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  describe('getCacheControlHeader', () => {
    it('should generate correct cache control header with given TTL', () => {
      const ttl = 600;
      const header = getCacheControlHeader(ttl);
      expect(header).toBe(
        'public, max-age=600, s-maxage=600, stale-while-revalidate=6000, stale-if-error=6000',
      );
    });

    it('should calculate stale time as 10x the TTL', () => {
      const ttl = 300;
      const header = getCacheControlHeader(ttl);
      expect(header).toBe(
        'public, max-age=300, s-maxage=300, stale-while-revalidate=3000, stale-if-error=3000',
      );
    });
  });

  describe('getConfigCacheControlHeader', () => {
    it('should use CONFIG_CACHE_TTL from environment when available', () => {
      process.env.CONFIG_CACHE_TTL = '900';
      const header = getConfigCacheControlHeader();
      expect(header).toBe(
        'public, max-age=900, s-maxage=900, stale-while-revalidate=9000, stale-if-error=9000',
      );
    });

    it('should use default TTL of 300 when CONFIG_CACHE_TTL is not set', () => {
      delete process.env.CONFIG_CACHE_TTL;
      const header = getConfigCacheControlHeader();
      expect(header).toBe(
        'public, max-age=5, s-maxage=5, stale-while-revalidate=50, stale-if-error=50',
      );
    });
  });

  describe('getDataCacheControlHeader', () => {
    it('should use DATA_CACHE_TTL from environment when available', () => {
      process.env.DATA_CACHE_TTL = '1200';
      const header = getDataCacheControlHeader();
      expect(header).toBe(
        'public, max-age=1200, s-maxage=1200, stale-while-revalidate=12000, stale-if-error=12000',
      );
    });

    it('should use default TTL of 300 when DATA_CACHE_TTL is not set', () => {
      delete process.env.DATA_CACHE_TTL;
      const header = getDataCacheControlHeader();
      expect(header).toBe(
        'public, max-age=300, s-maxage=300, stale-while-revalidate=3000, stale-if-error=3000',
      );
    });
  });
});
