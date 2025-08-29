import { OkaySchema } from "./okay.schema";

import { z } from "zod";
import { ApiErrorSchema } from "./error.schema";

/**
 * Services
 */

export const ServiceInfoSchema = z.object({
  name: z.string(),
  version: z.string().optional(),
});

export const HealthyServiceInfoSchema = OkaySchema.merge(
  ServiceInfoSchema
).extend({
  message: z.literal("healthy"),
});
export type HealthyServiceInfoSchema = z.infer<typeof HealthyServiceInfoSchema>;

export const UnhealthyServiceInfoSchema =
  ApiErrorSchema.merge(ServiceInfoSchema);
export type UnhealthyServiceInfoSchema = z.infer<
  typeof UnhealthyServiceInfoSchema
>;

export const ServiceStatusSchema = z.union([
  HealthyServiceInfoSchema,
  UnhealthyServiceInfoSchema,
]);
export type ServiceStatusSchema = z.infer<typeof ServiceStatusSchema>;

/**
 * API
 */
export const ApiInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  services: ServiceStatusSchema.array(),
});
export type ApiInfoSchema = z.infer<typeof ApiInfoSchema>;

export const HealthyApiStatusSchema = OkaySchema.merge(ApiInfoSchema);
export type HealthyApiStatusSchema = z.infer<typeof HealthyApiStatusSchema>;

export const UnhealthyApiStatusSchema = ApiErrorSchema.merge(ApiInfoSchema);
export type UnhealthyApiStatusSchema = z.infer<typeof UnhealthyApiStatusSchema>;

export const ApiStatusSchema = z.union([
  HealthyApiStatusSchema,
  UnhealthyApiStatusSchema,
]);
export type ApiStatusSchema = z.infer<typeof ApiStatusSchema>;
