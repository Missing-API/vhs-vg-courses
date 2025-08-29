import { CalendarSchema } from '@/calendar/types/calendar.types';
import { ResultSchema } from '@/rest/result.schema';
import { z } from 'zod';

export const GetCalendarSuccessfulSchema = ResultSchema.extend({
  data: CalendarSchema,
});
export type GetCalendarSuccessful = z.infer<typeof GetCalendarSuccessfulSchema>;
