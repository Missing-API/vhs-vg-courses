import { initContract } from "@ts-rest/core";
import { HealthContract } from "./health/health.contract";
import { LocationsContract } from "./locations/locations.contract";

const c = initContract();

export const ApiContract = c.router({
  health: HealthContract,
  locations: LocationsContract,
});
