import { ReducedGoogleEventSchema } from '@/clients/google/types/events.types';
import { ResultsSchema } from '@/rest/results.schema';
import { z } from 'zod';

export const GetEventsSuccessfulSchema = ResultsSchema.extend({
  data: z.array(ReducedGoogleEventSchema),
});
