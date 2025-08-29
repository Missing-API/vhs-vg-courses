import { getLogger } from '@/logging/logger';
import { getMateoContactsPage } from './mateo-get-contacts-page';
import { MateoContactListItem } from './types/mateo-contact-list.types';
import { clientLoggerMateo } from '@/logging/loggerApps.config';
import { cacheLife } from 'next/dist/server/use-cache/cache-life';
import { sleep } from '../helpers/process-batch';

const log = getLogger(clientLoggerMateo.contacts);

/**
 * Fetches all contacts by paginating through the entire contacts list
 * with a delay between requests to avoid rate limiting
 *
 * @returns Promise with all contacts
 */
export const getMateoContacts = async (): Promise<MateoContactListItem[]> => {
  'use cache';
  cacheLife('mateo');

  const allContacts: MateoContactListItem[] = [];
  let offset = 0;
  const limit = 50; // Maximum allowed by API
  let hasMore = true;

  while (hasMore) {
    const { contacts, hasMore: moreAvailable } = await getMateoContactsPage(
      offset,
      limit,
    );
    allContacts.push(...contacts);

    if (moreAvailable) {
      offset += limit;
      // Add timeout between requests to avoid rate limiting
      await sleep(500);
    } else {
      hasMore = false;
    }
  }

  log.info(
    { total: allContacts.length },
    'completed fetching all contacts from mateo',
  );
  return allContacts;
};
