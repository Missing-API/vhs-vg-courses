import { initContract } from "@ts-rest/core";
import {
  HealthyApiStatusSchema,
  UnhealthyApiStatusSchema,
} from "@/src/rest/health.schema";

const c = initContract();

export const HealthContract = c.router({
  health: {
    method: "GET",
    path: "/api/health",
    responses: {
      200: HealthyApiStatusSchema,
      503: UnhealthyApiStatusSchema,
    },
  },
});
