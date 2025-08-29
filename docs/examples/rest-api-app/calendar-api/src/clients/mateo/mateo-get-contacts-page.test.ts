// Mock modules first, before any imports
import { vi } from 'vitest';

// Move all mocks to the top, before any other imports
vi.mock('@/logging/logger', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

vi.mock('./helpers/config', () => ({
  getMateoApiConfig: () => ({
    host: 'https://api.example.com',
    token: 'fake-token',
  }),
}));

// Now import the rest
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { getMateoContactsPage } from './mateo-get-contacts-page';
import {
  mockMateoContactListPage1,
  mockMateoContactListPage2,
} from './data/contact-list.mock';

// Setup MSW server
const server = setupServer(
  http.get('https://api.example.com/api/v1/contact_details', ({ request }) => {
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get('offset')) || 0;

    if (offset === 0) {
      return HttpResponse.json(mockMateoContactListPage1);
    } else if (offset === 50) {
      return HttpResponse.json(mockMateoContactListPage2);
    }

    return HttpResponse.json([]);
  }),
);

describe('getMateoContactsPage', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  // TODO: check
  // it('should fetch first page of contacts', async () => {
  //   const { contacts, hasMore } = await getMateoContactsPage(0, 50);

  //   expect(contacts).toEqual(mockMateoContactListPage1);
  //   expect(hasMore).toBe(true);
  // });

  it('should fetch second page of contacts', async () => {
    const { contacts, hasMore } = await getMateoContactsPage(50, 50);

    expect(contacts).toEqual(mockMateoContactListPage2);
    expect(hasMore).toBe(false);
  });

  it('should handle API error gracefully', async () => {
    // Override handler to simulate an error
    server.use(
      http.get('https://api.example.com/api/v1/contact_details', () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    await expect(getMateoContactsPage(0, 50)).rejects.toThrow();
  });

  it('should handle unexpected response format', async () => {
    // Override handler to simulate malformed response
    server.use(
      http.get('https://api.example.com/api/v1/contact_details', () => {
        return HttpResponse.json({
          invalid: 'response structure',
        });
      }),
    );

    await expect(getMateoContactsPage(0, 50)).rejects.toThrow();
  });
});
