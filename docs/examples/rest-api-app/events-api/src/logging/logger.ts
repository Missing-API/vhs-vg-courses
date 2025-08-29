import pino, { Level, Logger } from "pino";
import { logLevelConfig } from "./logLevel.config";
import { normalizeError } from "./helpers/normalize-error";

/**
 * Gets log level based on logger name from config.
 * @param logger
 * @returns
 */
function getLogLevel(logger: string): Level {
  return (
    logLevelConfig.find((logLevel) => logLevel.app === logger)?.level ||
    logLevelConfig.find((logLevel) => logLevel.app === "*")?.level ||
    "info"
  );
}

/**
 * Extends the Pino Logger with additional convenience methods
 */
export interface ExtendedLogger extends Logger {
  /**
   * Log an error with normalized error object structure
   * @param error Any error object
   * @param message Optional message to accompany the error
   */
  error: Logger["error"] & ((error: object, message?: string) => void);
}

/**
 * Gets a logger instance with the specified name
 * @param name The logger name
 * @returns An extended logger instance
 */
export function getLogger(name: string): ExtendedLogger {
  const logger = pino({ name, level: getLogLevel(name) }) as ExtendedLogger;

  // Store the original error method before overriding it
  const originalError = logger.error;

  // Override the error method with our custom implementation
  logger.error = function (
    this: ExtendedLogger,
    error: object,
    message: string
  ): void {
    // Check if message is provided
    const errorObj = { error: normalizeError(error) };

    originalError.call(this, errorObj, message);
  } as ExtendedLogger["error"];

  return logger;
}
