import { CalendarSchema } from '@/calendar/types/calendar.types';
import { ResultsSchema } from '@/rest/results.schema';
import { z } from 'zod';

export const GetCalendarsSuccessfulSchema = ResultsSchema.extend({
  data: z.array(CalendarSchema),
});

export type GetCalendarsSuccessful = z.infer<
  typeof GetCalendarsSuccessfulSchema
>;
