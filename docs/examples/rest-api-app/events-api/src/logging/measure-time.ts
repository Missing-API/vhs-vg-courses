import { Logger } from "pino";

export async function measureTime<T>(
  name: string,
  fn: Promise<T>,
  log: Logger
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn;
    const duration = Date.now() - start;
    log.debug(`${name} took ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    log.debug(`${name} failed after ${duration}ms`);
    throw error;
  }
}
