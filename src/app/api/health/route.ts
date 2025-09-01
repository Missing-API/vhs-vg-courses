import { createNextHandler } from "@ts-rest/serverless/next";
import { HealthContract } from "./health.contract";
import packageJson from "../../../../package.json" assert { type: "json" };
import { checkVhsWebsiteHealth } from "../../../clients/vhs-website/check-vhs-website-health";


const handler = createNextHandler(
  HealthContract,
  {
    health: async () => {
      // Run external checks in parallel if more are added in future
      const [vhsWebsite] = await Promise.all([
        checkVhsWebsiteHealth().catch((e) => ({
          status: "unhealthy",
          responseTime: 0,
          statusCode: null,
          message: `Health check error: ${e?.message || "unknown error"}`,
          timestamp: new Date().toISOString(),
        })),
      ]);

      const apiStatus = {
        status: 200,
        message: "healthy", 
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        services: [
          {
            name: "vhsWebsite",
            version: undefined,
            status: vhsWebsite.status === "healthy" ? 200 : vhsWebsite.status === "degraded" ? 299 : 503,
            message: vhsWebsite.message,
            // keep only required fields for ServiceStatusSchema and attach details via non-breaking cast below if needed
          } as any,
        ],
      };
      
      return { 
        status: 200, 
        body: apiStatus 
      };
    },
  },
  {
    jsonQuery: true,
    responseValidation: true,
    handlerType: "app-router",
  }
);

export { handler as GET };
