// Mock modules first, before any imports
import { vi } from 'vitest';

// Move all mocks to the top, before any other imports
vi.mock('next/dist/server/use-cache/cache-life', () => ({
  cacheLife: vi.fn(),
}));

vi.mock('@/logging/logger', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

vi.mock('../helpers/process-batch', () => ({
  sleep: vi.fn(), // Mock sleep to make tests faster
}));

// Mock the dependency function instead of the config file
vi.mock('./mateo-get-contacts-page', () => ({
  getMateoContactsPage: vi.fn(),
}));

// Now import the rest
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { getMateoContacts } from './mateo-get-contacts';
import {
  mockMateoContactListPage1,
  mockMateoContactListPage2,
} from './data/contact-list.mock';
import { getMateoContactsPage } from './mateo-get-contacts-page';

describe('getMateoContacts', () => {
  beforeAll(() => {
    // Reset call history before each test
    vi.resetAllMocks();
  });

  afterEach(() => {
    // Reset mocked function implementations
    vi.resetAllMocks();
  });

  it('should fetch all contacts across multiple pages', async () => {
    // Mock the getMateoContactsPage function to return first page then second page
    (getMateoContactsPage as jest.MockedFunction<typeof getMateoContactsPage>)
      .mockResolvedValueOnce({
        contacts: mockMateoContactListPage1,
        hasMore: true,
      })
      .mockResolvedValueOnce({
        contacts: mockMateoContactListPage2,
        hasMore: false,
      });

    const contacts = await getMateoContacts();

    // Validate the results
    expect(contacts).toHaveLength(
      mockMateoContactListPage1.length + mockMateoContactListPage2.length,
    );

    // Verify getMateoContactsPage was called correctly
    expect(getMateoContactsPage).toHaveBeenCalledTimes(2);
    expect(getMateoContactsPage).toHaveBeenCalledWith(0, 50);
    expect(getMateoContactsPage).toHaveBeenCalledWith(50, 50);
  });

  it('should handle server errors gracefully', async () => {
    // Mock the function to throw an error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getMateoContactsPage as any).mockRejectedValueOnce(new Error('API error'));

    await expect(getMateoContacts()).rejects.toThrow('API error');
  });
});
