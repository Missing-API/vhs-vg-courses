import { initContract } from '@ts-rest/core';
import { HealthContract } from './health/health.contract';
import { CalendarsContract } from './calendars/calendars.contract';
import { OrganizersContract } from './organizers/organizers.contract';

const c = initContract();

export const ApiContract = c.router({
  health: HealthContract,
  organizers: OrganizersContract,
  calendars: CalendarsContract,
});
