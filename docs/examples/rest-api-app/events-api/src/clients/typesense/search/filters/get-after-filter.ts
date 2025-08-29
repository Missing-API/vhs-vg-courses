import { ISO8601, ISO8601Schema } from "../../../../rest/iso8601.types";

/**
 * Returns a date filter.
 * @param isoDate
 */
export const getAfterFilter = (isoDate?: ISO8601): string | undefined => {
  if (!isoDate) return undefined;

  const parseResult = ISO8601Schema.safeParse(isoDate);
  if (!parseResult.success) {
    throw new Error(`Invalid ISO8601 date format for after filter: ${isoDate}`);
  }

  const afterTimestamp: number = new Date(parseResult.data).getTime();
  const afterFilter: string = `start:>= ${afterTimestamp} || end:>= ${afterTimestamp}`;
  return afterFilter;
};
