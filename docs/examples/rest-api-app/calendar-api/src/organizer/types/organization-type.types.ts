import { z } from 'zod';

export const OrganizationTypeSchema = z.enum([
  'Association',
  'Company',
  'Hawker', // Mobiler Händler
  'Store', // Laden
  'Government',
  'Nonprofit',
  'Municipality', // Gemeindevertretung
  'Major', // Bürgermeisteramt
  'Administration',
  'Person', // Person
  'Foundation', // Stiftung
  'Church', // Kirche
  'Tourism', // Tourismus
  'Education', // Bildung
  'other',
]);
export type OrganizationType = z.infer<typeof OrganizationTypeSchema>;
