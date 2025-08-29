import { Calendar } from '../types/calendar.types';

/**
 * Search for a calendar by id.
 * Because we have no backend to ask for a calendar by id, we have to filter the calendars array.
 * @param calendars
 * @param id
 * @returns
 */
export const filterCalendarsById = (
  calendars: Calendar[],
  id: string,
): Calendar | null => {
  return calendars.find((calendar) => calendar.id === id) || null;
};
