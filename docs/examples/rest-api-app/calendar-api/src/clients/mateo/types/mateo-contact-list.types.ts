import { z } from 'zod';
import { MateoContactSchema } from './mateo-contact.types';

export const MateoContactListItemSchema = z
  .object({
    // id
    id: MateoContactSchema.shape.id,

    // name
    display_name: MateoContactSchema.shape.display_name,
    organization_name: MateoContactSchema.shape.organization_name,

    // active client
    tarif_status: MateoContactSchema.shape.tarif_status,

    // calendars
    google_calendar_id_01: MateoContactSchema.shape.google_calendar_id_01,
    google_calendar_id_02: MateoContactSchema.shape.google_calendar_id_02,
    google_calendar_id_03: MateoContactSchema.shape.google_calendar_id_03,
    google_calendar_id_04: MateoContactSchema.shape.google_calendar_id_04,
    google_calendar_id_05: MateoContactSchema.shape.google_calendar_id_05,
    google_calendar_id_06: MateoContactSchema.shape.google_calendar_id_06,
    google_calendar_id_07: MateoContactSchema.shape.google_calendar_id_07,
    google_calendar_id_08: MateoContactSchema.shape.google_calendar_id_08,
    google_calendar_id_09: MateoContactSchema.shape.google_calendar_id_09,
    google_calendar_id_10: MateoContactSchema.shape.google_calendar_id_10,
  })
  .describe('Basic contact information retrieved from contact list endpoint');
export type MateoContactListItem = z.infer<typeof MateoContactListItemSchema>;
