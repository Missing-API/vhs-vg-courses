import { OrganizerSchema } from '@/organizer/types/organizer.types';
import { ResultsSchema } from '@/rest/results.schema';
import { z } from 'zod';

export const GetOrganizersSuccessfulSchema = ResultsSchema.extend({
  data: z.array(OrganizerSchema),
});

export type GetOrganizersSuccessful = z.infer<
  typeof GetOrganizersSuccessfulSchema
>;
