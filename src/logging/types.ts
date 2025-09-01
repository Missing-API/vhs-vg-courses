// Central logging types and categories for VHS-VG Courses

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';

export type LogFormat = 'json' | 'pretty';
export type LogDestination = 'console' | 'file' | 'remote';

export type LogCategory =
  | 'vhsClient'          // VHS website client operations
  | 'courseProcessing'   // Course data processing
  | 'locationProcessing' // Location data processing
  | 'api'                // API endpoint operations
  | 'health';            // Health checks

export interface LogContext {
  category?: LogCategory;
  requestId?: string;
  operation?: string;
  durationMs?: number;
  url?: string;
  method?: string;
  status?: number;
  // Allows arbitrary structured fields
  [key: string]: unknown;
}

export interface LoggerOptions {
  level?: LogLevel;
  format?: LogFormat;
  destination?: LogDestination;
  requestDetails?: boolean;
  filePath?: string; // used when destination === 'file'
}

export const SERVICE_NAME = 'vhs-vg-courses';