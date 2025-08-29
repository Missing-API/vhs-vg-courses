// // const to map google calendar object to svf calebndar object

// import { calendar_v3 } from '@googleapis/calendar';
// import { SvFCalendar } from '../../../calendar/types/calendar.types';
// import {
//   TextWithData,
//   textToData,
// } from '@schafevormfenster/data-text-mapper/dist';

// export const mapGoogleCalendarToSvfCalendar = (
//   googleCalendar: calendar_v3.Schema$Calendar,
// ): SvFCalendar => {
//   const data: TextWithData | null = googleCalendar?.description
//     ? textToData(googleCalendar.description)
//     : null;

//   return {
//     id: googleCalendar.id,
//     summary: googleCalendar.summary,
//     description: data?.description || '',
//     tags: data?.tags || [],
//     scopes: data?.scopes || [],
//     url: data?.url || '',
//     organizer: {
//       id: 0,
//       name: '',
//     },
//   };
// };
