import { initContract } from '@ts-rest/core';

import { z } from 'zod';
import { ErrorSchema } from '@/rest/error.schema';
import { GetCalendarsSuccessfulSchema } from './get-calendars.schema';

const c = initContract();

export const GetCalendarsContract = c.router({
  'get-calendars': {
    method: 'GET',
    path: '/api/calendars',
    responses: {
      200: GetCalendarsSuccessfulSchema,
      400: ErrorSchema,
      500: ErrorSchema,
    },
    headers: z.object({
      'Sheep-Token': z.string().optional(),
    }),
    summary: 'Get a list of all google calendars.',
    description:
      'Get a list of all google calendars from organizers in the crm.',
  },
});
