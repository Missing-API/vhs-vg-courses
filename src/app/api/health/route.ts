import { createNextHandler } from "@ts-rest/serverless/next";
import { HealthContract } from "./health.contract";
import packageJson from "../../../../package.json" assert { type: "json" };

const handler = createNextHandler(
  HealthContract,
  {
    health: async () => {
      const apiStatus = {
        status: 200,
        message: "healthy", 
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        services: [],
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
