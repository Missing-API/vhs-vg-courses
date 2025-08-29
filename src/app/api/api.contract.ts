import { initContract } from "@ts-rest/core";
import { HealthContract } from "./health/health.contract";

const c = initContract();

export const ApiContract = c.router({
  health: HealthContract,
});
