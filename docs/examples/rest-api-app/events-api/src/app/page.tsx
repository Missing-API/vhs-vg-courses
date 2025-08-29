import SwaggerUI from "swagger-ui-react";
import { generateOpenApi } from "@ts-rest/open-api";
import { Metadata } from "next";
import packageJson from "../../package.json" assert { type: "json" };
import { ApiContract } from "./api/api.contract";

export const metadata: Metadata = {
  title: packageJson.name + " - Swagger",
  description: packageJson.description,
};

export default function Home() {
  const openApiDocument = generateOpenApi(ApiContract, {
    info: {
      title: packageJson.name,
      description: packageJson?.description,
      version: packageJson.version,
      contact: {
        name: packageJson.author.name,
        email: packageJson.author.email,
      },
      license: { name: packageJson.license },
    },
  });

  return <SwaggerUI spec={openApiDocument} />;
}
