import { GoogleEvent, ReducedGoogleEvent } from '../types/events.types';

export const reduceGoogleEvent = (
  googleEvent: GoogleEvent,
): ReducedGoogleEvent => {
  const reduceGoogleEvent: ReducedGoogleEvent = {
    id: googleEvent.id || '',
    created: googleEvent.created || '',
    updated: googleEvent.updated || '',
    summary: googleEvent.summary || '',
    description: googleEvent.description || '',
    location: googleEvent.location || '',
    organizer: {
      id: googleEvent.organizer?.id as string,
      email: googleEvent.organizer?.email || undefined,
      displayName: googleEvent.organizer?.displayName,
    },
    start: {
      date: googleEvent.start?.date || undefined,
      dateTime: googleEvent.start?.dateTime || undefined,
      timeZone: googleEvent.start?.timeZone || undefined,
    },
    end: googleEvent.end
      ? {
          date: googleEvent.end.date || undefined,
          dateTime: googleEvent.end.dateTime || undefined,
          timeZone: googleEvent.end.timeZone || undefined,
        }
      : undefined,
    sequence: googleEvent.sequence || undefined,
    // TODO: extend to several attachments later
    attachments: googleEvent.attachments
      ? [
          {
            fileUrl: googleEvent.attachments[0].fileUrl || undefined,
            title: googleEvent.attachments[0].title || undefined,
          },
        ]
      : undefined,
    recurrence: googleEvent.recurrence || undefined,
    recurringEventId: googleEvent.recurringEventId || undefined,
    status: googleEvent.status || 'unknown',
  };
  return reduceGoogleEvent;
};
