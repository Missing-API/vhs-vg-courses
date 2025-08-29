import { ZodError } from "zod";
import { TsRestResponse } from "@ts-rest/serverless";
import { ApiErrorSchema } from "./error.schema";

export async function handleZodError(err: unknown): Promise<TsRestResponse> {
  if (
    err instanceof ZodError ||
    (typeof err === "object" &&
      err !== null &&
      "statusCode" in err &&
      err.statusCode === 400)
  ) {
    const zodError: ApiErrorSchema = {
      status: 400,
      error: "Validation Error",
      trace: err,
    };
    return new TsRestResponse(JSON.stringify(zodError), { status: 400 });
  }

  const unknownError: ApiErrorSchema = {
    status: 500,
    error: "Internal Server Error",
    trace: err,
  };

  return new TsRestResponse(JSON.stringify(unknownError), { status: 500 });
}
