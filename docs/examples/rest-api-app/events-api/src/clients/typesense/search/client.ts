import Typesense from "typesense";
const client = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || "localhost", // For Typesense Cloud use typesense.cloud
      port: Number(process.env.TYPESENSE_PORT) || 8108, // For Typesense Cloud use 443
      protocol: process.env.TYPESENSE_PROTOCOL || "http", // For Typesense Cloud use https
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || "xyz",
  connectionTimeoutSeconds:
    Number(process.env.TYPESENSE_CONNECTION_TIMEOUT_SECONDS) || 5,
});

export default client;
