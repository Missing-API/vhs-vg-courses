import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Calendar } from '@/calendar/types/calendar.types';
import { Organizer } from '../types/organizer.types';
import { transformOrganizerToCalendars } from './transform-organizer-to-calendars';
import { transformOrganizersToCalendars } from './transform-organizers-to-calendars';

// Mock the dependency
vi.mock('./transform-organizer-to-calendars');

describe('transformOrganizersToCalendars', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return an empty array when given an empty array', () => {
    const result = transformOrganizersToCalendars([]);
    expect(result).toEqual([]);
    expect(transformOrganizerToCalendars).not.toHaveBeenCalled();
  });

  it('should transform each organizer to calendars and combine the results', () => {
    // Mock data
    const mockOrganizers: Organizer[] = [
      {
        id: 'org1',
        name: 'Organizer 1',
      } as Organizer,
      {
        id: 'org2',
        name: 'Organizer 2',
      } as Organizer,
    ];

    const mockCalendarsForOrg1: Calendar[] = [
      {
        id: 'cal1',
        type: 'google-calendar',
        organizer: { id: 'org-1', name: 'Org One' },
      } as Calendar,
      {
        id: 'cal2',
        type: 'google-calendar',
        organizer: { id: 'org-1', name: 'Org One' },
      } as Calendar,
    ];

    const mockCalendarsForOrg2: Calendar[] = [
      {
        id: 'cal3',
        type: 'google-calendar',
        organizer: { id: 'org-2', name: 'Org Two' },
      } as Calendar,
    ];

    // Mock the dependency function
    const mockTransformOrganizerToCalendars =
      transformOrganizerToCalendars as unknown as ReturnType<typeof vi.fn>;

    mockTransformOrganizerToCalendars
      .mockReturnValueOnce(mockCalendarsForOrg1)
      .mockReturnValueOnce(mockCalendarsForOrg2);

    // Call the function
    const result = transformOrganizersToCalendars(mockOrganizers);

    // Assertions
    expect(transformOrganizerToCalendars).toHaveBeenCalledTimes(2);
    expect(transformOrganizerToCalendars).toHaveBeenNthCalledWith(
      1,
      mockOrganizers[0],
    );
    expect(transformOrganizerToCalendars).toHaveBeenNthCalledWith(
      2,
      mockOrganizers[1],
    );

    expect(result).toHaveLength(3);
    expect(result).toEqual([...mockCalendarsForOrg1, ...mockCalendarsForOrg2]);
  });
});
