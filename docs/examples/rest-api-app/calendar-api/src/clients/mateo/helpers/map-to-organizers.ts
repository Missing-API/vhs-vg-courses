import { Organizer } from '@/organizer/types/organizer.types';
import { MateoContactListItem } from '../types/mateo-contact-list.types';
import { mapToOrganizer } from './map-to-organizer';

/**
 * Maps a mateo contact list item to an organizer object.
 * @param contact
 * @returns Organizer | null, Organizer is contact with active client status, null otherwise
 */
export const mapToOrganizers = (
  contacts: MateoContactListItem[],
): Organizer[] | [] => {
  // map to organizer object and filter out null values, if some were filtered out by mapping
  const organizers: Organizer[] = contacts
    .map((contact) => {
      return mapToOrganizer(contact);
    })
    .filter((organizer): organizer is Organizer => organizer !== null);

  return organizers ?? [];
};
