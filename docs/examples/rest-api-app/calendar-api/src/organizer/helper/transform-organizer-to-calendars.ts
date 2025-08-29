import { Calendar } from '@/calendar/types/calendar.types';
import { Organizer } from '../types/organizer.types';

export const transformOrganizerToCalendars = (
  organizer: Organizer,
): Calendar[] => {
  const calendars: Calendar[] = [];

  organizer.google_calendars.forEach((calendarId) => {
    calendars.push({
      id: calendarId,
      type: 'google-calendar',
      organizer: {
        id: organizer.id,
        name: organizer.name,
      },
    } as Calendar);
  });

  return calendars;
};
