import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createLogger } from '@/logging/logger';
import { withCategory } from '@/logging/helpers';

async function waitForFile(filePath: string, maxWaitMs = 1000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8').trim().length > 0) {
        return true;
      }
    } catch {
      // File might not exist yet
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  return false;
}

describe('e2e/logging', () => {
  it('writes to file destination', async () => {
    const logFile = path.join(process.cwd(), 'tests', 'tmp', 'e2e-log.log');
    fs.mkdirSync(path.dirname(logFile), { recursive: true });

    const log = createLogger({ destination: 'file', filePath: logFile, level: 'info' });
    const l = withCategory(log, 'api');

    l.info({ test: 'ok' }, 'hello');

    const fileExists = await waitForFile(logFile);
    expect(fileExists).toBe(true);

    const content = fs.readFileSync(logFile, 'utf8');
    expect(content.length).toBeGreaterThan(0);
    const first = JSON.parse(content.trim().split(/\r?\n/)[0]);
    expect(first.category).toBe('api');
    expect(first.level).toBe('info');
  });
});