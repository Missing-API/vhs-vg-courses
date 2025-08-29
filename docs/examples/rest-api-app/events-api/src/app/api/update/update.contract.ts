import { initContract } from "@ts-rest/core";
import { TriggerUpdateCalendarEventsContract } from "./calendars/single/trigger-update-calendar-events.contract";
import { TriggerUpdateAllContract } from "./calendars/all/trigger-update-all-calendars.contract";

const c = initContract();

export const UpdateContract = c.router({
  ...TriggerUpdateCalendarEventsContract,
  ...TriggerUpdateAllContract,
});
