import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import packageJson from '../../../../package.json';

// Mock the Next.js Request
const createMockRequest = (url: string = 'http://localhost:9200/api/health') => {
  return new NextRequest(url, {
    method: 'GET',
  });
};

// Mock external health check by stubbing global fetch used in checkVhsWebsiteHealth
const originalFetch = global.fetch;

describe('/api/health', () => {
  beforeEach(() => {
    (global as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: vi.fn().mockResolvedValue('<html><head></head><body></body></html>'),
    } as unknown as Response);
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    vi.resetAllMocks();
  });

  it('should return a healthy status with correct structure and include vhsWebsite service', async () => {
    const request = createMockRequest();
    
    const response = await GET(request);
    
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    
    const body = await response.json();
    
    // Verify response structure matches the schema baseline
    expect(body).toMatchObject({
      status: 200,
      message: 'healthy',
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
    });

    // Services should include vhsWebsite entry
    expect(Array.isArray(body.services)).toBe(true);
    const vhs = body.services.find((s: any) => s.name === 'vhsWebsite');
    expect(vhs).toBeTruthy();
    expect(vhs.status).toBeGreaterThanOrEqual(200);
  });

  it('should return correct package information', async () => {
    const request = createMockRequest();
    
    const response = await GET(request);
    const body = await response.json();
    
    expect(body.name).toBe('vhs-vg-courses');
    expect(body.version).toBe('1.0.0');
    expect(body.description).toBe('VHS VG Course Calendar API - Web scraping and calendar feed generation for Volkshochschule courses');
  });

  it('should have services array with vhsWebsite', async () => {
    const request = createMockRequest();
    
    const response = await GET(request);
    const body = await response.json();
    
    expect(Array.isArray(body.services)).toBe(true);
    expect(body.services.some((s: any) => s.name === 'vhsWebsite')).toBe(true);
  });

  it('should mark service unhealthy when external check fails', async () => {
    (global as any).fetch = vi.fn().mockRejectedValue(new Error('network down'));

    const request = createMockRequest();
    const response = await GET(request);
    const body = await response.json();

    const vhs = body.services.find((s: any) => s.name === 'vhsWebsite');
    expect(vhs).toBeTruthy();
    // our mapping sets 503 when unhealthy
    expect(vhs.status).toBe(503);
  });

  it('should validate basic types', async () => {
    const request = createMockRequest();
    
    const response = await GET(request);
    const body = await response.json();
    
    // Check that all required fields are present
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('description');
    expect(body).toHaveProperty('services');
    
    // Check types
    expect(typeof body.status).toBe('number');
    expect(typeof body.message).toBe('string');
    expect(typeof body.name).toBe('string');
    expect(typeof body.version).toBe('string');
    expect(typeof body.description).toBe('string');
    expect(Array.isArray(body.services)).toBe(true);
  });
});
