import { z } from "zod";

// Alternativ, wenn du den Fehler aus der verschachtelten Struktur extrahieren möchtest:
export const GoogleApiErrorSchema = z
  .object({
    // Extrahiere die wichtigen Felder aus der verschachtelten Struktur
    response: z.object({
      data: z.object({
        error: z.object({
          code: z.number().int(),
          message: z.string(),
        }),
      }),
      status: z.number().int(),
    }),

    // Direkter Zugriff auf die Top-Level-Felder
    status: z.number().int(),
    code: z.number().int(),
  })
  .catchall(z.any());

export type GoogleApiError = z.infer<typeof GoogleApiErrorSchema>;
