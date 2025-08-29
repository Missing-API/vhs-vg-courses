import { z } from 'zod';

export const MateoTarifSchema = z.enum([
  'Starter',
  'Professional',
  'Negotiated',
]);
export type MateoTarif = z.infer<typeof MateoTarifSchema>;

export const MateoTarifStatus = z.enum([
  'active',
  'cancelled',
  'expired',
  'prospect',
]);
export type MateoTarifStatus = z.infer<typeof MateoTarifStatus>;

export const MateoContactSchema = z.object({
  // customer classification
  serviceprovider: z
    .boolean()
    .nullish()
    .default(false)
    .describe('Is the contact a service provider?'),
  tarif: MateoTarifSchema.nullish().describe('Current tarif of the client'),
  tarif_valid_to: z
    .string()
    .nullish()
    .describe('Date when the tarif is valid to'),
  tarif_status: MateoTarifStatus.nullish(),
  tag: z.array(z.string()).nullish().describe('Tags for the contact'),

  // organizer information
  id: z.string().describe('Unique identifier of the contact'),
  display_name: z.string().describe('Display name of the organizer'),
  full_name: z.string().nullish().describe('Name of the organizer'),
  organization_name: z
    .string()
    .nullish()
    .describe('Formal name of the organization'),
  organization_type: z
    .string()
    .nullish()
    .describe('Type or segment of the organization'),
  first_name: z.string().nullish().describe('First name'),
  last_name: z.string().nullish().describe('Last name'),

  // contact information
  email: z.string().email().nullish().describe('Email address'),
  phone: z.string().nullish().describe('Phone number'),
  sms: z.string().nullish().describe('Mobile and SMS number'),
  whatsapp: z.string().nullish().describe('WhatsApp number'),
  instagram: z.string().nullish().describe('Instagram account'),
  facebook: z.string().nullish().describe('Facebook account'),

  // real world address
  address: z.string().nullish().describe('Street and house number'),
  city: z.string().nullish().describe('City or municipality'),
  postal_code: z.string().nullish().describe('Postal code'),
  state: z.string().nullish().describe('State'),
  county: z.string().nullish().describe('County or region'),
  country: z.string().nullish().default('DE').describe('Country'),

  // external references
  website: z.string().url().nullish().describe('Website of the organization'),
  wikidata_id: z.string().nullish().describe('Wikidata ID of the organization'),
  google_plus_code: z.string().nullish().describe('Google Plus Code'),
  google_place_id: z.string().nullish().describe('Google Place ID'),

  // calendars
  google_calendar_id_01: z.string().nullish(), // Google Kalender ID #01
  google_calendar_id_02: z.string().nullish(), // Google Kalender ID #02
  google_calendar_id_03: z.string().nullish(), // Google Kalender ID #03
  google_calendar_id_04: z.string().nullish(), // Google Kalender ID #04
  google_calendar_id_05: z.string().nullish(), // Google Kalender ID #05
  google_calendar_id_06: z.string().nullish(), // Google Kalender ID #06
  google_calendar_id_07: z.string().nullish(), // Google Kalender ID #07
  google_calendar_id_08: z.string().nullish(), // Google Kalender ID #08
  google_calendar_id_09: z.string().nullish(), // Google Kalender ID #09
  google_calendar_id_10: z.string().nullish(), // Google Kalender ID #10

  ics_calendar_url_01: z.string().nullish(), // ICS Kalender URL #01
  ics_calendar_url_02: z.string().nullish(), // ICS Kalender URL #02
  ics_calendar_url_03: z.string().nullish(), // ICS Kalender URL #03
  ics_calendar_url_04: z.string().nullish(), // ICS Kalender URL #04
  ics_calendar_url_05: z.string().nullish(), // ICS Kalender URL #05
  ics_calendar_url_06: z.string().nullish(), // ICS Kalender URL #06
  ics_calendar_url_07: z.string().nullish(), // ICS Kalender URL #07
  ics_calendar_url_08: z.string().nullish(), // ICS Kalender URL #08
  ics_calendar_url_09: z.string().nullish(), // ICS Kalender URL #09
  ics_calendar_url_10: z.string().nullish(), // ICS Kalender URL #10
});
export type MateoContact = z.infer<typeof MateoContactSchema>;
