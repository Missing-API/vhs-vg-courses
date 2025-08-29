import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

vi.mock('@/clients/vhs-website/vhs-search.client', async (orig) =&gt; {
  return {
    ...(await orig()),
    getLocations: vi.fn().mockResolvedValue([
      { id: 'anklam', name: 'Anklam', address: 'Markt 7, 17389 Anklam', courseCount: 77 },
      { id: 'greifswald', name: 'Greifswald', address: 'Martin-Luther-Str. 7a, 17489 Greifswald', courseCount: 155 },
      { id: 'pasewalk', name: 'Pasewalk', address: 'Gemeindewiesenweg 8, 17309 Pasewalk', courseCount: 73 },
    ]),
  };
});

const createMockRequest = (url: string = 'http://localhost:9200/api/locations') =&gt; {
  return new NextRequest(url, {
    method: 'GET',
  });
};

describe('/api/locations', () =&gt; {
  beforeEach(() =&gt; {
    vi.clearAllMocks();
  });

  afterEach(() =&gt; {
    vi.resetModules();
  });

  it('should return a list of all 3 locations with counts and addresses', async () =&gt; {
    const request = createMockRequest();
    const response = await GET(request);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    const cache = response.headers.get('cache-control') || '';
    expect(cache).toContain('max-age=86400');

    const body = await response.json();

    expect(body.totalLocations).toBe(3);
    expect(body.locations.length).toBe(3);
    expect(typeof body.totalCourses).toBe('number');
    expect(body.totalCourses).toBe(77 + 155 + 73);

    const ids = body.locations.map((l: any) =&gt; l.id).sort();
    expect(ids).toEqual(['anklam', 'greifswald', 'pasewalk']);

    body.locations.forEach((loc: any) =&gt; {
      expect(typeof loc.name).toBe('string');
      expect(typeof loc.address).toBe('string');
      expect(loc.address.length).toBeGreaterThan(5);
      expect(typeof loc.courseCount === 'number').toBe(true);
    });

    expect(new Date(body.lastUpdated).toString()).not.toBe('Invalid Date');
  });

  it('should have correct HTTP status and headers', async () =&gt; {
    const request = createMockRequest();
    const response = await GET(request);

    expect(response.status).toBe(200);
    const headers = response.headers;
    expect(headers.get('cache-control')).toContain('max-age=86400');
  });
});