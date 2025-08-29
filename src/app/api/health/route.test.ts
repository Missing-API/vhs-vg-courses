import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import packageJson from '../../../../package.json';

// Mock the Next.js Request
const createMockRequest = (url: string = 'http://localhost:9200/api/health') => {
  return new NextRequest(url, {
    method: 'GET',
  });
};

describe('/api/health', () => {
  it('should return a healthy status with correct structure', async () => {
    const request = createMockRequest();
    
    const response = await GET(request);
    
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    
    const body = await response.json();
    
    // Verify response structure matches the schema
    expect(body).toMatchObject({
      status: 200,
      message: 'healthy',
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      services: [],
    });
  });

  it('should return correct package information', async () => {
    const request = createMockRequest();
    
    const response = await GET(request);
    const body = await response.json();
    
    expect(body.name).toBe('vhs-vg-courses');
    expect(body.version).toBe('1.0.0');
    expect(body.description).toBe('VHS VG Course Calendar API - Web scraping and calendar feed generation for Volkshochschule courses');
  });

  it('should return an empty services array', async () => {
    const request = createMockRequest();
    
    const response = await GET(request);
    const body = await response.json();
    
    expect(body.services).toEqual([]);
    expect(Array.isArray(body.services)).toBe(true);
  });

  it('should have correct HTTP status and message', async () => {
    const request = createMockRequest();
    
    const response = await GET(request);
    const body = await response.json();
    
    expect(response.status).toBe(200);
    expect(body.status).toBe(200);
    expect(body.message).toBe('healthy');
  });

  it('should validate against the expected schema structure', async () => {
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
