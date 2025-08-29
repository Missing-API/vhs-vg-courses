import { calendar_v3 } from 'googleapis';
import { z } from 'zod';

export type GoogleEvent = calendar_v3.Schema$Event;

export const ReducedGoogleEventSchema = z.object({
  id: z.string(),
  created: z.string(),
  updated: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  location: z.string(),
  start: z.object({
    date: z.string().optional(),
    dateTime: z.string().optional(),
    timeZone: z.string().optional(),
  }),
  end: z
    .object({
      date: z.string().optional(),
      dateTime: z.string().optional(),
      timeZone: z.string().optional(),
    })
    .optional(),
  sequence: z.number().optional(),
  attachments: z
    .array(
      z.object({
        fileUrl: z.string().optional(),
        title: z.string().optional(),
      }),
    )
    .optional(),
  recurrence: z.array(z.string()).optional(),
  recurringEventId: z.string().optional(),
  status: z.string(),
  organizer: z
    .object({
      id: z.string(),
      email: z.string().optional(),
      displayName: z.string().nullish(),
    })
    .optional(),
});
export type ReducedGoogleEvent = z.infer<typeof ReducedGoogleEventSchema>;

// pick id, created, updated, summary, description, location, creator, organizer, start, end, iCalUID, sequence, attachments, recurrence from calendar_v3.Schema$Event
// export type ReducedGoogleEvent = Pick<
//   calendar_v3.Schema$Event,
//   | 'id'
//   | 'created'
//   | 'updated'
//   | 'summary'
//   | 'description'
//   | 'location'
//   | 'start'
//   | 'end'
//   | 'sequence'
//   | 'attachments'
//   | 'recurrence'
//   | 'recurringEventId'
//   | 'status'
//   | 'kind'
// > & {
//   organizer?: Omit<
//     calendar_v3.Schema$Event['organizer'],
//     'displayName' | 'self'
//   > | null;
// };

// pick   organizer.email

export interface FetchEventsQuery {
  calendarId: string;
  timeMin?: string;
  timeMax?: string;
  updatedMin?: string;
}

export interface FetchEventsPageQuery extends FetchEventsQuery {
  pageToken?: string;
}

export type EventList = ReducedGoogleEvent[];

export interface FetchEventsResult {
  calendarId: string;
  results: number;
  data: EventList;
  nextPageToken?: string;
}
