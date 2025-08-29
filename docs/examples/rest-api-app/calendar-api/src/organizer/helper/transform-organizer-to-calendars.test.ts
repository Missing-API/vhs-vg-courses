import { describe, it, expect } from 'vitest';
import { transformOrganizerToCalendars } from './transform-organizer-to-calendars';
import { Organizer } from '../types/organizer.types';
import { Calendar } from '@/calendar/types/calendar.types';

describe('transformToCalendars', () => {
  it('should transform an organizer with google calendars to calendar array', () => {
    // Arrange
    const mockOrganizer: Organizer = {
      id: 'org-123',
      name: 'Test Organizer',
      google_calendars: ['calendar-1', 'calendar-2', 'calendar-3'],
    };

    const expected: Calendar[] = [
      {
        id: 'calendar-1',
        type: 'google-calendar',
        organizer: {
          id: 'org-123',
          name: 'Test Organizer',
        },
      } as Calendar,
      {
        id: 'calendar-2',
        type: 'google-calendar',
        organizer: {
          id: 'org-123',
          name: 'Test Organizer',
        },
      } as Calendar,
      {
        id: 'calendar-3',
        type: 'google-calendar',
        organizer: {
          id: 'org-123',
          name: 'Test Organizer',
        },
      } as Calendar,
    ];

    // Act
    const result = transformOrganizerToCalendars(mockOrganizer);

    // Assert
    expect(result.length).toBe(3);
    expect(result).toEqual(expected);
  });

  it('should return empty array when organizer has no google calendars', () => {
    // Arrange
    const mockOrganizer: Organizer = {
      id: 'org-123',
      name: 'Test Organizer',
      google_calendars: [],
    };

    // Act
    const result = transformOrganizerToCalendars(mockOrganizer);

    // Assert
    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });
});
