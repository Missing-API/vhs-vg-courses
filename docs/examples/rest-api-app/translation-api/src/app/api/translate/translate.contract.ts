import { initContract } from "@ts-rest/core";
import { TranslationRequestSchema, TranslationSuccessfulSchema } from "./translate.schema";
import { ApiErrorSchema } from "@/src/rest/error.schema";

const c = initContract();

export const TranslateContract = c.router({
  translate: {
    method: "POST",
    path: "/api/translate",
    body: TranslationRequestSchema,
    responses: {
      200: TranslationSuccessfulSchema,
      400: ApiErrorSchema,
      500: ApiErrorSchema,
    },
  },
});
