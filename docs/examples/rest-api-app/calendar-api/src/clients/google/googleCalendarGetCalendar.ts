// import { CalendarQuery, CalendarResult } from './types/getCalendar.types';
// import { SvFCalendar } from '../../calendar/types/calendar.types';
// import { mapGoogleCalendarToSvfCalendar } from './helpers/mapGoogleCalendarToSvfCalendar';
// import { getLogger } from '../../../logging/log-util';
// import { apiclient } from '../../../logging/loggerApps.config';
// import { GaxiosResponse } from 'gaxios';
// import { calendarApiClient } from './client/client';

// export const googleCalendarGetCalendar = async (
//   query: CalendarQuery,
// ): Promise<CalendarResult | null> => {
//   const log = getLogger(apiclient.googlecalendar.get);

//   if (!query.calendarId) {
//     const errorMessage: string = `Invalid calendar query. Calendar id is missing.`;
//     log.error(
//       {
//         query: query,
//       },
//       errorMessage,
//     );
//     return Promise.reject(new Error(errorMessage));
//     // throw new Error(errorMessage);
//   }

//   try {
//     const calendarApiResponse: GaxiosResponse =
//       await calendarApiClient.calendars.get({
//         calendarId: query.calendarId,
//       });

//     const calendar: SvFCalendar = mapGoogleCalendarToSvfCalendar(
//       calendarApiResponse.data,
//     );

//     return calendar;
//   } catch (error: GaxiosResponse | any) {
//     // if no calendar found, return null as technical positive but empty result
//     if (error?.code === 404) {
//       log.info(
//         {
//           calendarId: query.calendarId,
//         },
//         'Calendar not found.',
//       );
//       return Promise.resolve(null);
//     }

//     // for all other errors, thow an exception
//     const errorMessage: string = `Could not fetch calendar details from google api.`;
//     log.error(
//       {
//         calendarId: query.calendarId,
//         error: {
//           code: error?.code,
//           message: error?.statusText || error?.message,
//         },
//       },
//       errorMessage,
//     );
//     return Promise.reject(new Error(errorMessage));
//     // throw new Error(errorMessage, {
//     //   cause: error,
//     // });
//   }
// };
