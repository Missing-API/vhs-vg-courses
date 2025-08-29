import { z } from 'zod';

export const TarifSchema = z.enum(['Starter', 'Professional', 'Negotiated']);
export type Tarif = z.infer<typeof TarifSchema>;
