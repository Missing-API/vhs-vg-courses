import { describe, it, expect } from 'vitest';
import { filterCalendarsById } from './filter-calendars-by-id';
import { Calendar } from '../types/calendar.types';

describe('filterCalendarsById', () => {
  // Sample test data
  const mockCalendars: Calendar[] = [
    {
      id: '1',
      type: 'google-calendar',
      organizer: {
        id: 'org1',
        name: 'Organizer 1',
      },
    },
    {
      id: '2',
      type: 'google-calendar',
      organizer: {
        id: 'org2',
        name: 'Organizer 2',
      },
    },
    {
      id: '3',
      type: 'google-calendar',
      organizer: {
        id: 'org3',
        name: 'Organizer 3',
      },
    },
  ];

  it('should return the calendar with the given ID when it exists', () => {
    const result = filterCalendarsById(mockCalendars, '2');
    expect(result).toBeDefined();
    expect(result?.id).toBe('2');
    expect(result?.organizer.name).toBe('Organizer 2');
  });

  it('should return null when no calendar with the given ID exists', () => {
    const result = filterCalendarsById(mockCalendars, '4');
    expect(result).toBeNull();
  });

  it('should handle an empty calendar array', () => {
    const result = filterCalendarsById([], '1');
    expect(result).toBeNull();
  });

  it('should handle case-sensitive IDs correctly', () => {
    // Add a calendar with an ID that would match '1' if case-insensitive
    const calendarsWithMixedCase = [
      ...mockCalendars,
      {
        id: 'A1',
        type: 'google-calendar',
        organizer: {
          id: 'org4',
          name: 'Organizer A1',
        },
      },
    ] as Calendar[];

    const result = filterCalendarsById(calendarsWithMixedCase, 'A1');
    expect(result?.id).toBe('A1');
    expect(result?.organizer.name).toBe('Organizer A1');
  });

  it('should return null when id cases differ', () => {
    // Add a calendar with an ID that would match '1' if case-insensitive
    const calendarsWithMixedCase = [
      ...mockCalendars,
      {
        id: 'A1',
        type: 'google-calendar',
        organizer: {
          id: 'org4',
          name: 'Organizer A1',
        },
      },
    ] as Calendar[];

    const result = filterCalendarsById(calendarsWithMixedCase, 'a1');
    expect(result).toBeNull();
  });
});
