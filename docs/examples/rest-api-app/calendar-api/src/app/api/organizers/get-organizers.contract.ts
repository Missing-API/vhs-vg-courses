import { initContract } from '@ts-rest/core';

import { z } from 'zod';
import { ErrorSchema } from '@/rest/error.schema';
import { GetOrganizersSuccessfulSchema } from './get-organizers.schema';

const c = initContract();

export const GetOrganizersContract = c.router({
  'get-organizers': {
    method: 'GET',
    path: '/api/organizers',
    responses: {
      200: GetOrganizersSuccessfulSchema,
      400: ErrorSchema,
      500: ErrorSchema,
    },
    headers: z.object({
      'Sheep-Token': z.string().optional(),
    }),
    summary: 'Get a list of all organizers',
    description: 'Get a list of all organizers from the crm system.',
  },
});
