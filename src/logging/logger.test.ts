import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import logger, { createLogger } from './logger';
import { withCategory, startTimer, errorToObject } from './helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tmpDir = path.join(__dirname, '../../..', 'tests', 'tmp', 'logs');

function readLines(p: string) {
  const content = fs.readFileSync(p, 'utf8');
  return content.trim().split(/\r?\n/);
}

beforeEach(() => {
  fs.mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  // cleanup files
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {}
});

describe('logger/createLogger', () => {
  it('filters by level', async () => {
    const logfile = path.join(tmpDir, 'level.log');
    const log = createLogger({ level: 'warn', destination: 'file', filePath: logfile });
    const l = withCategory(log, 'api');

    l.info({ test: true }, 'info should be filtered');
    l.warn({ test: true }, 'warn should pass');

    // Give pino some time to flush
    await new Promise((r) => setTimeout(r, 20));

    const lines = readLines(logfile);
    expect(lines.length).toBe(1);
    const obj = JSON.parse(lines[0]);
    expect(obj.level).toBe('warn');
    expect(obj.category).toBe('api');
  });

  it('writes structured json with fields', async () => {
    const logfile = path.join(tmpDir, 'json.log');
    const log = createLogger({ level: 'info', destination: 'file', filePath: logfile });
    const l = withCategory(log, 'vhsClient');
    const end = startTimer();

    l.info({ operation: 'fetch', url: 'https://example.com', status: 200, durationMs: end() }, 'done');

    await new Promise((r) => setTimeout(r, 20));

    const lines = readLines(logfile);
    expect(lines.length).toBe(1);
    const obj = JSON.parse(lines[0]);
    expect(obj.service).toBeDefined();
    expect(obj.level).toBe('info');
    expect(obj.category).toBe('vhsClient');
    expect(obj.operation).toBe('fetch');
    expect(obj.url).toBe('https://example.com');
    expect(typeof obj.durationMs).toBe('number');
  });

  it('logs error objects', async () => {
    const logfile = path.join(tmpDir, 'error.log');
    const log = createLogger({ level: 'error', destination: 'file', filePath: logfile });
    const l = withCategory(log, 'api');

    const err = new Error('boom');
    l.error({ err: errorToObject(err), operation: 'test' }, 'failed');

    await new Promise((r) => setTimeout(r, 20));

    const [line] = readLines(logfile);
    const obj = JSON.parse(line);
    expect(obj.level).toBe('error');
    expect(obj.err.message).toMatch('boom');
    expect(obj.operation).toBe('test');
  });
});