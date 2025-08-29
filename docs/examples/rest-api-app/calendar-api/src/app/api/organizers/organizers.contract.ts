import { initContract } from '@ts-rest/core';
import { GetOrganizersContract } from './get-organizers.contract';

const c = initContract();

export const OrganizersContract = c.router({
  ...GetOrganizersContract,
});
