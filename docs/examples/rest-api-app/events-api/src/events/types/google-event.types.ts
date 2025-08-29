import { calendar_v3 } from "@googleapis/calendar";
import Schema$EventAttachment = calendar_v3.Schema$EventAttachment;
import Schema$EventDateTime = calendar_v3.Schema$EventDateTime;
import { z } from "zod";
import { ISO8601DateSchema, ISO8601Schema } from "../../rest/iso8601.types";
import { Timezone } from "../../rest/timezone.types";

export const GoogleEventOrganizer = z.object({
  displayName: z.string().optional(),
  email: z.string().optional(),
  id: z.string().optional(),
  self: z.boolean().optional(),
});
export type GoogleEventOrganizer = z.infer<typeof GoogleEventOrganizer>;

export const GoogleEventDateTime = z.object({
  date: ISO8601DateSchema.optional(),
  dateTime: ISO8601Schema.optional(),
  timeZone: Timezone.optional(),
});
export type GoogleEventDateTime =
  | z.infer<typeof GoogleEventDateTime>
  | Schema$EventDateTime;

export const GoogleEventAttachment = z.object({
  fileId: z.string().optional(),
  fileUrl: z.string(),
  iconLink: z.string().optional(),
  mimeType: z.string().optional(),
  title: z.string().optional(),
});
export type GoogleEventAttachment =
  | z.infer<typeof GoogleEventAttachment>
  | Schema$EventAttachment;

export const GoogleEventTimeDataSchema = z.object({
  start: GoogleEventDateTime,
  end: GoogleEventDateTime.optional(),
  sequence: z.number().optional(),
  recurrence: z.array(z.string()).optional(),
  recurringEventId: z.string().optional(),
});
export type GoogleEventTimeData = z.infer<typeof GoogleEventTimeDataSchema>;

export const GoogleEventSchema = z
  .object({
    // system
    id: z.string(),
    kind: z.literal("calendar#event").optional(),
    created: ISO8601Schema.optional(),
    updated: ISO8601Schema.optional(),
    status: z.string().optional(),
    // content
    summary: z.string(),
    description: z.string().optional(),
    location: z.string(),
    attachments: z.array(GoogleEventAttachment).optional(),
    // context
    organizer: GoogleEventOrganizer.optional(),
  })
  .merge(GoogleEventTimeDataSchema);
export type GoogleEvent = z.infer<typeof GoogleEventSchema>;
