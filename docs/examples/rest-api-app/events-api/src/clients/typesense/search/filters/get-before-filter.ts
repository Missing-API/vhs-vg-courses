import { ISO8601, ISO8601Schema } from "../../../../rest/iso8601.types";

/**
 * Returns a date filter.
 * @param isoDate
 */
export const getBeforeFilter = (isoDate?: ISO8601): string | undefined => {
  if (!isoDate) return undefined;

  const parseResult = ISO8601Schema.safeParse(isoDate);
  if (!parseResult.success) {
    throw new Error(
      `Invalid ISO8601 date format for before filter: ${isoDate}`
    );
  }

  const beforeTimestamp: number = new Date(parseResult.data).getTime();
  const beforeFilter: string = `start:<= ${beforeTimestamp}`;
  return beforeFilter;
};
