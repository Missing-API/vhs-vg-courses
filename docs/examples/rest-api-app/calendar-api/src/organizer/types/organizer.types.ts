import { z } from 'zod';

/**
 * Minimal information about an organizer.
 * Will be expanded in the future.
 */
export const OrganizerSchema = z.object({
  id: z.string().describe('Unique identifier of the contact'),

  // organizer information
  name: z.string().describe('Display name of the organizer'),
  organization: z
    .string()
    .nullish()
    .describe('Formal name of the organization'),

  // calendars
  google_calendars: z.array(z.string()).describe('Google Kalender IDs'),
});
export type Organizer = z.infer<typeof OrganizerSchema>;

// TODO: OrganizerDetailSchema
// with all detail information

export const OrganizerTeaserSchema = z.object({
  id: OrganizerSchema.shape.id,
  name: OrganizerSchema.shape.name,
});
export type OrganizerTeaser = z.infer<typeof OrganizerTeaserSchema>;
