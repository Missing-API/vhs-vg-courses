import { createNextHandler } from "@ts-rest/serverless/next";
import { HealthContract } from "./health.contract";
import packageJson from "../../../../package.json" assert { type: "json" };
<<<<<<< HEAD
import { checkVhsWebsiteHealth } from "../../../clients/vhs-website/check-vhs-website-health";

=======
import { checkVhsWebsiteHealth } from "@/clients/vhs-website/check-vhs-website-health";
import type { ServiceStatusSchema } from "@/rest/health.schema";
>>>>>>> 6524168 (Fix vhs website service health check.)

const handler = createNextHandler(
  HealthContract,
  {
    health: async () => {
      try {
        // Run external checks in parallel if more are added in future
        const [vhsWebsite] = await Promise.all([
          checkVhsWebsiteHealth().catch((e) => ({
            status: "unhealthy" as const,
            responseTime: 0,
            statusCode: null,
            message: `Health check error: ${e?.message || "unknown error"}`,
            timestamp: new Date().toISOString(),
          })),
        ]);

        // Map health check result to service status schema
        const vhsWebsiteService: ServiceStatusSchema = 
          vhsWebsite.status === "healthy" 
            ? {
                status: 200,
                message: "healthy",
                name: "vhsWebsite",
                version: undefined,
              }
            : {
                status: vhsWebsite.status === "degraded" ? 299 : 503,
                error: vhsWebsite.message,
                name: "vhsWebsite",
                version: undefined,
              };

        // Determine overall API status
        const allHealthy = vhsWebsite.status === "healthy";
        const overallStatus = allHealthy ? 200 : 503;

        const apiResponse = {
          status: overallStatus,
          message: allHealthy ? "healthy" : "unhealthy",
          name: packageJson.name,
          version: packageJson.version,
          description: packageJson.description,
          services: [vhsWebsiteService],
        };

        if (allHealthy) {
          return { 
            status: 200, 
            body: apiResponse 
          };
        } else {
          return { 
            status: 503, 
            body: {
              ...apiResponse,
              error: "Some services are unhealthy",
            }
          };
        }
      } catch (error) {
        // Fallback error response
        return {
          status: 500,
          body: {
            status: 500,
            error: "Internal server error during health check",
            name: packageJson.name,
            version: packageJson.version,
            description: packageJson.description,
            services: [],
          },
        };
      }
    },
  },
  {
    jsonQuery: true,
    responseValidation: true,
    handlerType: "app-router",
  }
);

export { handler as GET };
