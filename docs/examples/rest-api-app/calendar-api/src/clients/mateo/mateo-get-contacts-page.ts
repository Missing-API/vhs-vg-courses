import { MateoContactListItem } from './types/mateo-contact-list.types';
import { getMateoApiConfig } from './helpers/config';
import { getLogger } from '@/logging/logger';
import { clientLoggerMateo } from '@/logging/loggerApps.config';
import { getDataCacheTTL } from '@/config/cache-control-header';

const log = getLogger(clientLoggerMateo['contacts.page']);

/**
 * Response from the contact list API
 */
export interface GetMateoContactsPageResponse {
  contacts: MateoContactListItem[];
  hasMore: boolean;
}

/**
 * Fetches a single page of contacts from the Mateo API
 *
 * @param offset - Number of records to skip
 * @param limit - Number of records to retrieve (max 50)
 * @returns Promise with contact list and whether there are more pages
 */
export const getMateoContactsPage = async (
  offset: number = 0,
  limit: number = 50,
): Promise<GetMateoContactsPageResponse> => {
  try {
    const config = getMateoApiConfig();
    const url = new URL('/api/v1/contact_details', config.host);

    // Configure the contacts query

    // fiter for active tarif
    url.searchParams.append('tarif_status', 'eq.active');

    // select baisc fields id and name and all google calendar fields
    url.searchParams.append(
      'select',
      'id,display_name,organization_name,google_calendar_id_01,google_calendar_id_02,google_calendar_id_03,google_calendar_id_04,google_calendar_id_05,google_calendar_id_06,google_calendar_id_07,google_calendar_id_08,google_calendar_id_09,google_calendar_id_10',
    );

    // order by display name for better human readability while debugging
    url.searchParams.append('order', 'display_name.asc');

    // pagination
    url.searchParams.append('offset', offset.toString());
    url.searchParams.append('limit', limit.toString());

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'force-cache',
      next: {
        tags: ['contacts', `contacts-${offset}-${limit}`],
        revalidate: getDataCacheTTL(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error fetching contacts page`, {
        cause: `${response.status} ${response.statusText}`,
      });
    }

    const data: unknown = await response.json();

    // Validate response structure
    if (!data || typeof data !== 'object' || !Array.isArray(data)) {
      throw new Error('Invalid contacts data, expected array');
    }

    const contacts = data as MateoContactListItem[];

    // Check if there might be more contacts based on returned count vs requested limit
    const hasMore = contacts.length >= limit;

    return {
      contacts,
      hasMore,
    };
  } catch (error) {
    log.error({ error, offset, limit }, 'error fetching contacts page');
    throw error;
  }
};
