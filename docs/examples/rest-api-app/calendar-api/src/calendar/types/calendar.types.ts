import { z } from 'zod';
import { OrganizerTeaserSchema } from '@/organizer/types/organizer.types';

export const CalendarSchema = z.object({
  id: z.string(),
  type: z.literal('google-calendar'), // TODO: extend later
  organizer: OrganizerTeaserSchema,
});
export type Calendar = z.infer<typeof CalendarSchema>;

// TODO: CalendarDetailSchema
// add name, description, default scope, default tag, etc.

export const CalendarTeaserSchema = z.object({
  id: CalendarSchema.shape.id,
});
export type CalendarTeaser = z.infer<typeof CalendarTeaserSchema>;
