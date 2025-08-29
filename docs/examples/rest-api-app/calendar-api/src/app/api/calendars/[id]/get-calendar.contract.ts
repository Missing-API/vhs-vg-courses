import { initContract } from '@ts-rest/core';

import { z } from 'zod';
import { ErrorSchema } from '@/rest/error.schema';
import { GetCalendarSuccessfulSchema } from './get-calendar.schema';

const c = initContract();

export const GetCalendarContract = c.router({
  'get-calendar': {
    method: 'GET',
    path: '/api/calendars/:id',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: GetCalendarSuccessfulSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    headers: z.object({
      'Sheep-Token': z.string().optional(),
    }),
    summary: 'Get a calendar.',
    description:
      'Get a google calendar (detail) by id with basic organizer info.',
  },
});
