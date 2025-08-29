import {
  HealthyApiStatusSchema,
  UnhealthyApiStatusSchema,
} from '@/rest/health.schema';
import { initContract } from '@ts-rest/core';

const c = initContract();

export const HealthContract = c.router({
  health: {
    method: 'GET',
    path: '/api/health',
    responses: {
      200: HealthyApiStatusSchema,
      503: UnhealthyApiStatusSchema,
    },
  },
});
