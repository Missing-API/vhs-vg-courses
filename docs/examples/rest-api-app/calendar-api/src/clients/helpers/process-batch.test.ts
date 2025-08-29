import { describe, it, expect, vi } from 'vitest';
import { sleep, processBatch } from './process-batch';

describe('process batch', () => {
  describe('sleep', () => {
    it('should wait for the specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(95); // allowing small timing variance
    });
  });

  describe('processBatch', () => {
    it('should process all items', async () => {
      const items = [1, 2, 3, 4, 5];
      const processFn = vi.fn(async (x: number) => x * 2);

      const results = await processBatch(items, 2, processFn);

      expect(results).toEqual([2, 4, 6, 8, 10]);
      expect(processFn).toHaveBeenCalledTimes(5);
    });

    it('should respect concurrency limit', async () => {
      const items = [1, 2, 3, 4];
      const concurrency = 2;
      const inProgress = new Set<number>();

      const processFn = vi.fn(async (x: number) => {
        inProgress.add(x);
        await sleep(10);
        const currentSize = inProgress.size;
        inProgress.delete(x);
        return currentSize;
      });

      const results = await processBatch(items, concurrency, processFn);

      expect(Math.max(...results)).toBeLessThanOrEqual(concurrency);
    });

    it('should handle empty input array', async () => {
      const processFn = vi.fn(async (x: number) => x);
      const results = await processBatch([], 2, processFn);

      expect(results).toEqual([]);
      expect(processFn).not.toHaveBeenCalled();
    });

    it('should apply delay between batch items', async () => {
      const items = [1, 2];
      const delayMs = 100;
      const processFn = vi.fn(async (x: number) => x);

      const start = Date.now();
      await processBatch(items, 2, processFn, delayMs);
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(95); // allowing small timing variance
    });

    it('should handle errors in process function', async () => {
      const items = [1, 2, 3];
      const processFn = vi.fn(async (x: number) => {
        if (x === 2) throw new Error('Test error');
        return x;
      });

      await expect(processBatch(items, 2, processFn)).rejects.toThrow(
        'Test error',
      );
    });
  });
});
