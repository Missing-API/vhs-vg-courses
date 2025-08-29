import { getLogger } from '@/logging/logger';
import { processBatch } from '../helpers/process-batch';
import { googleCalendarFetchEvents } from './google-calendar-fetch-events';
import { clientLoggerGoogle } from '@/logging/loggerApps.config';
import {
  FetchEventsQuery,
  FetchEventsPageQuery,
  FetchEventsResult,
  ReducedGoogleEvent,
} from './types/events.types';
import { cacheLife } from 'next/dist/server/use-cache/cache-life';

const log = getLogger(clientLoggerGoogle['events.get']);

/**
 * Fetches all events from a Google Calendar, handling pagination automatically
 *
 * @param query - Parameters for the calendar events query
 * @param concurrency - Number of concurrent requests to make (default: 3)
 * @param delayMs - Delay between pagination requests in milliseconds (default: 100)
 * @returns Promise with all event data combined from all pages
 */
export const googleCalendarGetEvents = async (
  query: FetchEventsQuery,
  concurrency = 3,
  delayMs = 100,
): Promise<ReducedGoogleEvent[]> => {
  'use cache';
  cacheLife('google');

  log.debug({ query }, 'Starting to fetch all events from Google Calendar');

  const allEvents: ReducedGoogleEvent[] = [];

  // Fetch first page to get initial data and nextPageToken
  const firstPageQuery: FetchEventsPageQuery = {
    ...query,
    pageToken: undefined,
  };

  const firstPageResult = await googleCalendarFetchEvents(firstPageQuery);

  if (!firstPageResult) {
    log.warn({ query }, 'No results returned from first page query');
    return [];
  }

  // Add first page results to our collection
  allEvents.push(...firstPageResult.data);

  // Collect all page tokens we need to fetch
  const pageTokens: string[] = [];
  let nextPageToken = firstPageResult.nextPageToken;

  while (nextPageToken) {
    pageTokens.push(nextPageToken);

    // Here we need to fetch the next page to get the next token
    // We're building up our full list of pages to fetch with processBatch
    const nextPageQuery: FetchEventsPageQuery = {
      ...query,
      pageToken: nextPageToken,
    };

    const pageResult = await googleCalendarFetchEvents(nextPageQuery);
    if (!pageResult || !pageResult.nextPageToken) {
      break;
    }

    allEvents.push(...pageResult.data);
    nextPageToken = pageResult.nextPageToken;
  }

  // If we have page tokens, process them in batches
  if (pageTokens.length > 0) {
    log.info(
      { pageCount: pageTokens.length, calendarId: query.calendarId },
      `Processing ${pageTokens.length} additional pages with processBatch`,
    );

    // Use processBatch to fetch remaining pages in parallel with controlled concurrency
    const pageResults = await processBatch<string, FetchEventsResult | null>(
      pageTokens,
      concurrency,
      async (pageToken) => {
        const pageQuery: FetchEventsPageQuery = {
          ...query,
          pageToken,
        };
        return googleCalendarFetchEvents(pageQuery);
      },
      delayMs,
    );

    // Add all events from batch processing
    for (const result of pageResults) {
      if (result && result.data) {
        allEvents.push(...result.data);
      }
    }
  }

  log.info(
    { eventsCount: allEvents.length, calendarId: query.calendarId },
    'Successfully fetched all events from Google Calendar',
  );

  return allEvents;
};
