import { initContract } from '@ts-rest/core';
import { GetCalendarsContract } from './get-calendars.contract';
import { GetCalendarContract } from './[id]/get-calendar.contract';
import { GetEventsContract } from './[id]/events/get-events.contract';

const c = initContract();

export const CalendarsContract = c.router({
  ...GetCalendarsContract,
  ...GetCalendarContract,
  ...GetEventsContract,
});
