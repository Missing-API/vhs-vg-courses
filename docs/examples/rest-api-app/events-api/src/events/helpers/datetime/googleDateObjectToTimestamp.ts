export interface GoogleDateObject {
  date: string;
}

export const googleDateObjectToTimestamp = (date: GoogleDateObject): number => {
  // extract year, month and day from date string like "2023-03-29"
  const year = parseInt(date.date.substring(0, 4));
  const month = parseInt(date.date.substring(5, 7)) - 1; // month is 0-based
  const day = parseInt(date.date.substring(8, 10));
  return new Date(Date.UTC(year, month, day, 3, 0, 0, 0)).getTime(); // use 3am utc as default for dates without time
};
