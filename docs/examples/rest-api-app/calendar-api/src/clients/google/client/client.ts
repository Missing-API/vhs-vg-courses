import { calendar_v3 } from '@googleapis/calendar';
import { googleAuth } from './auth';
import { google } from 'googleapis';

export const calendarApiClient = google.calendar({
  version: 'v3',
  auth: googleAuth,
} as calendar_v3.Options);
