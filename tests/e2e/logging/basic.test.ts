import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createLogger } from '@/logging/logger';
import { withCategory } from '@/logging/helpers';

describe('e2e/logging', () => {
  it('writes to file destination', async () => {
    const logFile = path.join(process.cwd(), 'tests', 'tmp', 'e2e-log.log');
    fs.mkdirSync(path.dirname(logFile), { recursive: true });

    const log = createLogger({ destination: 'file', filePath: logFile, level: 'info' });
    const l = withCategory(log, 'api');

    l.info({ test: 'ok' }, 'hello');

    await new Promise((r) => setTimeout(r, 20));

    const content = fs.readFileSync(logFile, 'utf8');
    expect(content.length).toBeGreaterThan(0);
    const first = JSON.parse(content.trim().split(/\r?\n/)[0]);
    expect(first.category).toBe('api');
    expect(first.level).toBe('info');
  });
});