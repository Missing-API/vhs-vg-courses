import { Organizer } from '@/organizer/types/organizer.types';
import { MateoContactListItem } from '../types/mateo-contact-list.types';

/**
 * Maps a mateo contact list item to an organizer object.
 * @param contact
 * @returns Organizer | null, Organizer is contact with active client status, null otherwise
 */
export const mapToOrganizer = (
  contact: MateoContactListItem,
): Organizer | null => {
  // Filter validations
  if (!contact.id) return null;
  if (contact.tarif_status !== 'active') return null;

  // Collect google calendar IDs
  const googleCalendars = [
    contact.google_calendar_id_01,
    contact.google_calendar_id_02,
    contact.google_calendar_id_03,
    contact.google_calendar_id_04,
    contact.google_calendar_id_05,
    contact.google_calendar_id_06,
    contact.google_calendar_id_07,
    contact.google_calendar_id_08,
    contact.google_calendar_id_09,
    contact.google_calendar_id_10,
  ].filter((id): id is string => id !== null && id !== undefined);

  // Return mapped organizer
  return {
    id: contact.id,
    name: contact.display_name || (contact.organization_name as string),
    organization: contact.organization_name as string,
    google_calendars: googleCalendars,
  };
};
