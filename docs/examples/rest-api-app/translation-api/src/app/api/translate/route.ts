import { createNextHandler } from "@ts-rest/serverless/next";
import { TranslateContract } from "./translate.contract";
import { getLogger } from '../../../../logging/log-util';
import { translateJson } from '../../../clients/googletranslate/googletranslate-translate-json';
import { TranslationRequestSchema, TranslationSuccessfulSchema } from './translate.schema';
import { handleZodError } from "@/src/rest/zod-error-handler";
import { ApiError } from "@/src/rest/error.schema";

const logger = getLogger('api/translate');

const handler = createNextHandler(
  TranslateContract,
  {
    // @ts-expect-error - Type mismatch with ts-rest handler signature
    translate: async ({ body }) => {
      logger.debug({ body }, "Translation request received");

      try {
        // Validate incoming request body
        const validatedRequest = TranslationRequestSchema.parse(body);
        
        // Call translation function
        const translationData = await translateJson({
          content: validatedRequest.content,
          language: validatedRequest.language,
        });

        // Create successful response
        const response = {
          status: 200 as const,
          message: "Translation successful",
          timestamp: new Date().toISOString(),
          data: translationData,
        };

        // Validate response before returning
        const validatedResponse = TranslationSuccessfulSchema.parse(response);
        
        logger.info({ content: validatedRequest.content }, "Translation completed successfully");
        
        return {
          status: 200,
          body: validatedResponse,
        };
      } catch (error) {
        logger.error({ error }, "Translation failed");
        
        if (error instanceof Error) {
          throw new ApiError(400, `Translation failed: ${error.message}`);
        }
        
        throw new ApiError(500, "Internal server error");
      }
    },
  },
  {
    jsonQuery: true,
    responseValidation: true,
    handlerType: "app-router",
    errorHandler: handleZodError,
  }
);

export { handler as POST };
