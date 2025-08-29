import { Calendar } from '@/calendar/types/calendar.types';
import { Organizer } from '../types/organizer.types';
import { transformOrganizerToCalendars } from './transform-organizer-to-calendars';

export const transformOrganizersToCalendars = (
  organizers: Organizer[],
): Calendar[] => {
  const calendars: Calendar[] = [];

  organizers.forEach((organizer) => {
    calendars.push(...transformOrganizerToCalendars(organizer));
  });

  return calendars;
};
