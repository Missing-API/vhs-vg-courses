import type { LogContext, LogCategory } from './types';

const SENSITIVE_KEYS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'password',
  'token',
  'access_token',
  'refresh_token',
  'secret',
]);

export function sanitize(obj: Record<string, unknown> | undefined | null) {
  if (!obj || typeof obj !== 'object') return obj;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      out[k] = '[redacted]';
      continue;
    }
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = sanitize(v as Record<string, unknown>);
    } else {
      out[k] = v as unknown;
    }
  }
  return out;
}

export function errorToObject(err: unknown) {
  if (err instanceof Error) {
    return {
      type: err.name,
      message: err.message,
      stack: err.stack,
    };
  }
  try {
    return { message: String(err) };
  } catch {
    return { message: 'Unknown error' };
  }
}

export function startTimer() {
  const start = process.hrtime.bigint();
  return function end(): number {
    const end = process.hrtime.bigint();
    const ns = Number(end - start);
    return Math.round(ns / 1_000_000); // ms
  };
}

export function getRequestId(headers?: Headers | Record<string, string | string[] | undefined>) {
  if (!headers) return crypto.randomUUID();
  const val = (headers instanceof Headers)
    ? headers.get('x-request-id')
    : (typeof headers === 'object' ? (headers['x-request-id'] as string | undefined) : undefined);
  return val || crypto.randomUUID();
}

export type AnyLogger = {
  level: string;
  child(bindings: Record<string, unknown>): AnyLogger;
  info(obj: unknown, msg?: string): void;
  warn(obj: unknown, msg?: string): void;
  error(obj: unknown, msg?: string): void;
  debug(obj: unknown, msg?: string): void;
  trace?(obj: unknown, msg?: string): void;
};

export function withCategory(logger: AnyLogger, category: LogCategory, extra?: Record<string, unknown>) {
  return logger.child({ category, ...extra });
}

export function withRequest(logger: AnyLogger, requestId: string, extra?: Record<string, unknown>) {
  return logger.child({ requestId, ...extra });
}