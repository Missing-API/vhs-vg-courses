import { MateoContact, MateoContactSchema } from './types/mateo-contact.types';
import { getMateoApiConfig } from './helpers/config';
import { getLogger } from '@/logging/logger';
import { clientLoggerMateo } from '@/logging/loggerApps.config';
import { getDataCacheTTL } from '@/config/cache-control-header';

const log = getLogger(clientLoggerMateo.contact);

type GetMateoContactResponse = MateoContact | null;

export const getMateoContact = async (
  id: string,
): Promise<GetMateoContactResponse> => {
  try {
    const config = getMateoApiConfig();
    // use search Params
    const url = new URL(`/api/v1/contact_details`, config.host);
    url.searchParams.append('id', `eq.${id}`);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'force-cache',
      // use query cache better than function cache
      next: {
        tags: ['contact', `contact-${id}`],
        revalidate: getDataCacheTTL(),
      },
    });

    if (!response.ok) {
      throw new Error(`http error on fetchig contact details`, {
        cause: `${response.status} ${response.statusText}`,
      });
    }

    // get data
    const data: unknown[] = await response.json();

    // check if data is an array
    if (!Array.isArray(data)) {
      throw new Error('invalid contact data, data is not an array');
    }

    // check if data is an empty array
    if (!data || data.length === 0) {
      log.info({ id: id }, 'no contact details found for given id');
      return null;
    }

    // check if data[0] is an object with at least one key "id"
    if (
      data[0] === null ||
      typeof data[0] !== 'object' ||
      !Object.keys(data[0]).includes('id')
    ) {
      throw new Error('invalid contact data, data[0] is not an object');
    }

    // filter contact
    const mateoContact = MateoContactSchema.parse(data[0] as object);
    return mateoContact;
  } catch (error) {
    log.error({ error }, 'error getting contact');
    throw error;
  }
};
