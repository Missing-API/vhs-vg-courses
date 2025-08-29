import { getMateoApiConfig } from './helpers/config';
import { ApiConfig } from '../helpers/config';
import { getLogger } from '@/logging/logger';
import { clientLoggerMateo } from '@/logging/loggerApps.config';
import {
  HealthyServiceInfoSchema,
  ServiceStatusSchema,
  UnhealthyServiceInfoSchema,
} from '@/rest/health.schema';
import { getConfigCacheTTL } from '@/config/cache-control-header';

const log = getLogger(clientLoggerMateo.config);

/**
 * Checks the health of the crm-api at integration.getmateo.com.
 * @returns Promise<ServiceStatusSchema>
 */
export const checkMateoApiHealth = async (): Promise<ServiceStatusSchema> => {
  const apiName = 'crm-api';
  const apiVersion = 'v1';
  try {
    const config: ApiConfig = getMateoApiConfig();
    const url = new URL(`/api/${apiVersion}/contact`, config.host); // using the contacts endpoint as a health check
    log.info({ api: apiName, url: url.toString() }, 'checking api health');
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'force-cache',
      next: {
        revalidate: getConfigCacheTTL(),
        tags: ['health'],
      },
    });

    // send unhealthy status if response is not ok
    if (!response.ok) {
      const serviceInfo: UnhealthyServiceInfoSchema = {
        name: apiName,
        version: apiVersion,
        status: response.status,
        error: response.statusText,
      };
      return serviceInfo;
    }

    // send healthy status if response is ok
    const serviceInfo: HealthyServiceInfoSchema = {
      name: apiName,
      version: apiVersion,
      status: response.status | 200,
      message: 'healthy',
    };
    return serviceInfo;
  } catch (error) {
    log.error({ api: apiName, error }, 'error checking api health');

    // send unhealthy status if any unexpected error occurs
    const serviceInfo: UnhealthyServiceInfoSchema = {
      name: apiName,
      version: apiVersion,
      status: 503,
      error: 'Unknown error',
    };
    return serviceInfo;
  }
};
