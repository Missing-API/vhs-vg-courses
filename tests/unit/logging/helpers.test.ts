import { describe, it, expect } from 'vitest';
import { sanitize, errorToObject, startTimer } from '@/logging/helpers';

describe('logging/helpers', () => {
  it('sanitizes sensitive fields', () => {
    const input = {
      headers: {
        authorization: 'secret',
        cookie: 'a=b',
        ok: 'yes'
      },
      password: '123',
      token: '456',
      nested: { refresh_token: '789', keep: 'k' }
    } as any;
    const out: any = sanitize(input);
    expect(out.headers.authorization).toBe('[redacted]');
    expect(out.headers.cookie).toBe('[redacted]');
    expect(out.headers.ok).toBe('yes');
    expect(out.password).toBe('[redacted]');
    expect(out.token).toBe('[redacted]');
    expect(out.nested.refresh_token).toBe('[redacted]');
    expect(out.nested.keep).toBe('k');
  });

  it('serializes error objects', () => {
    const e = new Error('boom');
    const obj = errorToObject(e);
    expect(obj.message).toMatch('boom');
    expect(obj.type).toBe('Error');
  });

  it('measures duration', async () => {
    const end = startTimer();
    await new Promise((r) => setTimeout(r, 5));
    const ms = end();
    expect(ms).toBeGreaterThanOrEqual(1);
  });
});