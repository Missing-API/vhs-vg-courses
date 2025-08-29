/**
 * Helper function to pause execution for specified milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Processes items in batches with concurrency control
 *
 * @param items - List of items to process
 * @param concurrency - Maximum number of concurrent requests
 * @param processFn - Function to process each item
 * @param delayMs - Delay between each request in milliseconds
 * @returns Promise with processed results
 */
export async function processBatch<T, R>(
  items: T[],
  concurrency: number,
  processFn: (item: T) => Promise<R>,
  delayMs: number = 0,
): Promise<R[]> {
  const results: R[] = [];

  // Process items in batches with specified concurrency
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);

    // Process batch concurrently
    const batchPromises = batch.map(async (item, index) => {
      // Add delay between requests within a batch
      if (index > 0 && delayMs > 0) {
        await sleep(index * delayMs);
      }
      return processFn(item);
    });

    // Wait for all promises in current batch to resolve
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}
